from typing import List, Optional, Tuple
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.student import Student
from ..models.match import Match, MatchParticipant, MatchStatus
import random

class MatchmakingService:
    def __init__(self, max_rating_diff: int = 300):
        """
        Initialize matchmaking service
        max_rating_diff: Maximum ELO rating difference allowed for a match
        """
        self.max_rating_diff = max_rating_diff

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

    async def find_opponents(
        self, student: Student, num_players: int, db: AsyncSession
    ) -> List[Student]:
        """Find suitable opponents for the student based on ELO rating"""
        # Query for potential opponents within rating range
        query = select(Student).where(
            and_(
                Student.id != student.id,
                Student.elo_rating >= student.elo_rating - self.max_rating_diff,
                Student.elo_rating <= student.elo_rating + self.max_rating_diff
            )
        )
        result = await db.execute(query)
        opponents = result.scalars().all()

        if len(opponents) < num_players - 1:  # -1 because we already have the requesting student
            return []

        # Sort opponents by rating difference to prefer closer matches
        opponents.sort(key=lambda o: abs(o.elo_rating - student.elo_rating))
        
        # Take the closest N-1 opponents but add some randomness
        closest_opponents = opponents[:num_players * 2 - 2]  # Take 2x what we need for randomness
        return random.sample(closest_opponents, num_players - 1)

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
