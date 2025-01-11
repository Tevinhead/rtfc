from typing import List, Optional, Tuple, Dict
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.student import Student
from ..models.match import Match, MatchParticipant, MatchStatus
import random
import math
from datetime import datetime, timedelta, timezone

class MatchmakingService:
    def __init__(self, max_rating_diff: int = 300, recent_matches_window: int = 3):
        """
        Initialize matchmaking service
        max_rating_diff: Maximum ELO rating difference allowed for a match
        recent_matches_window: Number of hours to look back for recent matches
        """
        self.max_rating_diff = max_rating_diff
        self.recent_matches_window = recent_matches_window

    async def find_match(
        self, student_id: str, db: AsyncSession
    ) -> Optional[Match]:
        """Find an existing pending match for the student"""
        # Join with match_participants to find matches this student is in
        query = (
            select(Match)
            .join(MatchParticipant)
            .where(
                and_(
                    MatchParticipant.student_id == student_id,
                    Match.status == MatchStatus.PENDING
                )
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_recent_opponents(
        self, student_id: str, db: AsyncSession
    ) -> Dict[str, datetime]:
        """Get a map of recent opponents and when they last played"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.recent_matches_window)
        
        # Query recent matches for this student
        query = (
            select(Match, MatchParticipant)
            .join(MatchParticipant)
            .where(
                and_(
                    Match.created_at >= cutoff_time,
                    MatchParticipant.student_id != student_id,
                    Match.id.in_(
                        select(MatchParticipant.match_id)
                        .where(MatchParticipant.student_id == student_id)
                    )
                )
            )
        )
        
        result = await db.execute(query)
        recent_opponents = {}
        
        for match, participant in result:
            opponent_id = str(participant.student_id)
            match_time = match.created_at
            if opponent_id not in recent_opponents or match_time > recent_opponents[opponent_id]:
                recent_opponents[opponent_id] = match_time
                
        return recent_opponents

    async def get_participation_counts(
        self, db: AsyncSession, hours: int = 24
    ) -> Dict[str, int]:
        """Get number of matches played by each student in recent time period"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        query = (
            select(
                MatchParticipant.student_id,
                func.count(MatchParticipant.match_id).label('match_count')
            )
            .join(Match)
            .where(Match.created_at >= cutoff_time)
            .group_by(MatchParticipant.student_id)
        )
        
        result = await db.execute(query)
        return {str(row.student_id): row.match_count for row in result}

    def calculate_opponent_score(
        self,
        opponent: Student,
        student: Student,
        recent_opponents: Dict[str, datetime],
        participation_counts: Dict[str, int],
        max_participation: int
    ) -> float:
        """Calculate a score for an opponent based on multiple factors"""
        # Base score from ELO difference (0-1, higher is better)
        elo_diff = abs(opponent.elo_rating - student.elo_rating)
        elo_score = 1.0 - (elo_diff / self.max_rating_diff)
        
        # Recent matchup penalty (0-1, higher is better)
        recency_score = 1.0
        if str(opponent.id) in recent_opponents:
            hours_ago = (datetime.now(timezone.utc) - recent_opponents[str(opponent.id)]).total_seconds() / 3600
            recency_score = min(hours_ago / self.recent_matches_window, 1.0)
            
        # Participation balance score (0-1, higher is better)
        participation_score = 1.0
        opponent_matches = participation_counts.get(str(opponent.id), 0)
        if max_participation > 0:
            participation_score = 1.0 - (opponent_matches / max_participation)
            
        # Weighted combination of factors
        # ELO difference is most important (0.5)
        # Recent matchups second most important (0.3)
        # Participation balance least important but still considered (0.2)
        return (0.5 * elo_score) + (0.3 * recency_score) + (0.2 * participation_score)

    async def find_opponents(
        self, student: Student, num_players: int, db: AsyncSession, potential_opponents: Optional[List[Student]] = None
    ) -> List[Student]:
        """
        Find suitable opponents for the student based on multiple factors
        potential_opponents: Optional list of students to choose from. If None, will query all students.
        """
        if potential_opponents is not None:
            # Filter provided opponents by rating range
            opponents = [
                o for o in potential_opponents
                if (o.id != student.id and
                    o.elo_rating >= student.elo_rating - self.max_rating_diff and
                    o.elo_rating <= student.elo_rating + self.max_rating_diff)
            ]
        else:
            # Query all potential opponents within rating range
            query = select(Student).where(
                and_(
                    Student.id != student.id,
                    Student.elo_rating >= student.elo_rating - self.max_rating_diff,
                    Student.elo_rating <= student.elo_rating + self.max_rating_diff
                )
            )
            result = await db.execute(query)
            opponents = result.scalars().all()

        if len(opponents) < num_players - 1:
            return []

        # Get recent matchup data
        recent_opponents = await self.get_recent_opponents(str(student.id), db)
        
        # Get participation data
        participation_counts = await self.get_participation_counts(db)
        max_participation = max(participation_counts.values()) if participation_counts else 0
        
        # Score each opponent
        scored_opponents = [
            (
                opponent,
                self.calculate_opponent_score(
                    opponent,
                    student,
                    recent_opponents,
                    participation_counts,
                    max_participation
                )
            )
            for opponent in opponents
        ]
        
        # Sort by score (highest to lowest)
        scored_opponents.sort(key=lambda x: x[1], reverse=True)
        
        # Take top half of opponents and use weighted random selection
        top_opponents = scored_opponents[:len(scored_opponents) // 2]
        total_score = sum(score for _, score in top_opponents)
        
        selected_opponents = []
        remaining_opponents = top_opponents.copy()
        
        # Select opponents one at a time using weighted random selection
        for _ in range(num_players - 1):
            if not remaining_opponents:
                break
                
            # Calculate selection weights
            weights = [score for _, score in remaining_opponents]
            total = sum(weights)
            if total > 0:
                weights = [w/total for w in weights]
            else:
                weights = [1.0/len(remaining_opponents)] * len(remaining_opponents)
            
            # Select an opponent
            selected_idx = random.choices(range(len(remaining_opponents)), weights=weights)[0]
            selected_opponents.append(remaining_opponents[selected_idx][0])
            remaining_opponents.pop(selected_idx)
            
        return selected_opponents

    async def create_multiplayer_match(
        self,
        player_ids: List[str],
        num_rounds: int,
        db: AsyncSession
    ) -> Match:
        """Create a new match with multiple players"""
        # Get all students and verify they exist
        participants = []
        for pid in player_ids:
            student = await db.get(Student, pid)
            if not student:
                raise ValueError(f"Student {pid} not found")
            participants.append(student)

        # Create the match
        match = Match(
            status=MatchStatus.PENDING,
            num_rounds=num_rounds,
        )
        db.add(match)
        await db.flush()  # Get match.id

        # Create participant records
        for student in participants:
            mp = MatchParticipant(
                match_id=match.id,
                student_id=student.id,
                elo_before=student.elo_rating
            )
            db.add(mp)

        await db.commit()
        await db.refresh(match)
        return match

    async def auto_find_players_and_create_match(
        self,
        num_players: int,
        num_rounds: int,
        student_id: str,
        db: AsyncSession
    ) -> Match:
        """
        Automatically find players with similar ELO and create a match.
        student_id is the requesting player who will be included.
        """
        student = await db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")

        # Find opponents with similar ratings
        opponents = await self.find_opponents(student, num_players, db)
        if len(opponents) < num_players - 1:
            raise ValueError(f"Could not find {num_players - 1} suitable opponents")

        # Create match with found players plus requesting student
        player_ids = [str(student.id)] + [str(o.id) for o in opponents]
        return await self.create_multiplayer_match(player_ids, num_rounds, db)
