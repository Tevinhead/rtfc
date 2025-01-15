from typing import List, Optional, Tuple, Dict
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.student import Student
from ..models.match import Match, MatchParticipant, MatchStatus
from ..models.arena_session import ArenaParticipant
import random
import math
from datetime import datetime, timedelta, timezone
from .elo_service import EloService

class MatchmakingService:
    """
    A robust matchmaking service that:
    1) Ensures each participant gets a roughly equal number of matches
    2) Slightly prefers matching players with similar ELO ratings
    3) Supports both upfront schedule generation and on-demand matching
    4) Avoids re-matching the same pair unless absolutely necessary
    """
    def __init__(
        self,
        k_factor: int = 32,
        max_matches_per_round: int = 1,
        elo_tolerance: int = 300,
        recent_matches_window: int = 3,
        random_seed: Optional[int] = None
    ):
        """
        Initialize matchmaking service
        :param k_factor: ELO k-factor used in rating calculations
        :param max_matches_per_round: Typically '1' if each player plays once per round
        :param elo_tolerance: Maximum ELO difference to consider "good" for pairing
        :param recent_matches_window: Hours to look back for recent matches
        :param random_seed: Optional seed for reproducible results in testing
        """
        self.elo_service = EloService(k_factor)
        self.max_matches_per_round = max_matches_per_round
        self.elo_tolerance = elo_tolerance
        self.recent_matches_window = recent_matches_window
        if random_seed is not None:
            random.seed(random_seed)

    async def generate_match_schedule(
        self,
        db: AsyncSession,
        arena_id: str,
        participants: List[ArenaParticipant],
        total_matches: int,
    ) -> List[Tuple[str, str]]:
        """
        Generates a schedule of matchups ensuring:
          - Each participant gets a roughly equal number of matches
          - We prefer pairing players with similar ELO (plus some randomness)
          - We avoid repeat matchups unless we have no choice
        """
        # Gather participant info including ELO ratings
        participant_info = []
        for ap in participants:
            student = ap.student
            participant_info.append({
                "student_id": str(student.id),
                "elo": student.elo_rating,
                "fights_played": ap.fights_played,
            })

        # Sort by ELO ascending so neighbors are close in rating
        participant_info.sort(key=lambda x: x["elo"])

        def pairing_score(p1, p2):
            """Calculate how good a pairing is (lower is better). 
               Closer ELO => lower score. Add some random factor."""
            elo_diff = abs(p1["elo"] - p2["elo"])
            random_factor = random.random() * 50.0  # Up to 50 random points
            if elo_diff <= self.elo_tolerance:
                return elo_diff + random_factor
            else:
                return (elo_diff * 2.0) + random_factor

        # Calculate matches per participant
        n = len(participant_info)
        if n < 2:
            return []

        total_slots = total_matches * 2
        base_needed = total_slots // n
        remainder = total_slots % n

        # Assign remaining matches to each participant
        for idx, p in enumerate(participant_info):
            p["remaining"] = base_needed + (1 if idx < remainder else 0)

        schedule: List[Tuple[str, str]] = []
        matched_pairs = set()  # Track used pairs to avoid repeats unless necessary

        # Generate matches while possible
        while len(schedule) < total_matches:
            candidates = [p for p in participant_info if p["remaining"] > 0]
            if len(candidates) < 2:
                break

            # Find best pairing among candidates
            best_pair = None
            best_score = float('inf')
            found_new_pair = False  # Track if we found any unused pairs

            # First pass: Try to find unused pairs
            for i in range(len(candidates)):
                for j in range(i + 1, len(candidates)):
                    p1 = candidates[i]
                    p2 = candidates[j]
                    # Skip if either can't play
                    if p1["remaining"] <= 0 or p2["remaining"] <= 0:
                        continue

                    pair_tuple = tuple(sorted([p1["student_id"], p2["student_id"]]))
                    
                    # Calculate normal pairing score
                    s = pairing_score(p1, p2)

                    # If this pair hasn't been used yet, consider it
                    if pair_tuple not in matched_pairs:
                        found_new_pair = True
                        if s < best_score:
                            best_score = s
                            best_pair = (p1, p2, pair_tuple)

            # If we couldn't find any new pair, allow a rematch
            if not found_new_pair:
                # Second pass: Consider all pairs if we must
                for i in range(len(candidates)):
                    for j in range(i + 1, len(candidates)):
                        p1 = candidates[i]
                        p2 = candidates[j]
                        if p1["remaining"] <= 0 or p2["remaining"] <= 0:
                            continue
                        s = pairing_score(p1, p2)
                        if s < best_score:
                            best_score = s
                            pair_tuple = tuple(sorted([p1["student_id"], p2["student_id"]]))
                            best_pair = (p1, p2, pair_tuple)

            if not best_pair:
                break

            p1, p2, pair_tuple = best_pair
            schedule.append((p1["student_id"], p2["student_id"]))
            p1["remaining"] -= 1
            p2["remaining"] -= 1
            matched_pairs.add(pair_tuple)  # Track this pair as used

        return schedule

    async def store_generated_matches(
        self,
        db: AsyncSession,
        arena_id: str,
        matchups: List[Tuple[str, str]],
    ) -> None:
        """Store generated match schedule in database"""
        for (p1, p2) in matchups:
            new_match = Match(
                arena_id=arena_id,
                status=MatchStatus.PENDING,
                num_rounds=1,
                rounds_completed=0,
            )
            db.add(new_match)
            await db.flush()

            # Get current ELO ratings
            s1 = await db.get(Student, p1)
            s2 = await db.get(Student, p2)

            mp1 = MatchParticipant(
                match_id=new_match.id,
                student_id=p1,
                elo_before=s1.elo_rating if s1 else 1000
            )
            mp2 = MatchParticipant(
                match_id=new_match.id,
                student_id=p2,
                elo_before=s2.elo_rating if s2 else 1000
            )
            db.add_all([mp1, mp2])

        await db.commit()

    async def find_or_create_match_schedule(
        self,
        db: AsyncSession,
        arena_id: str,
        participants: List[ArenaParticipant],
        total_matches: int,
    ) -> None:
        """High-level method to generate and store a complete match schedule"""
        matchups = await self.generate_match_schedule(
            db, arena_id, participants, total_matches
        )
        await self.store_generated_matches(db, arena_id, matchups)

    async def get_recent_opponents(
        self,
        student_id: str,
        db: AsyncSession,
    ) -> Dict[str, datetime]:
        """Get map of recent opponents and when they last played"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.recent_matches_window)
        
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

    async def find_match(
        self,
        student_id: str,
        db: AsyncSession
    ) -> Optional[Match]:
        """Find an existing pending match for the student"""
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
        self,
        student: Student,
        num_opponents: int,
        db: AsyncSession,
        potential_opponents: Optional[List[Student]] = None
    ) -> List[Student]:
        """Find suitable opponents for a student based on ELO rating"""
        if potential_opponents is None:
            # Find potential opponents within ELO range
            query = select(Student).where(
                and_(
                    Student.id != student.id,
                    Student.elo_rating >= student.elo_rating - self.elo_tolerance,
                    Student.elo_rating <= student.elo_rating + self.elo_tolerance
                )
            )
            result = await db.execute(query)
            potential_opponents = result.scalars().all()

        if len(potential_opponents) < num_opponents:
            return []

        # Sort by ELO proximity and add some randomness
        potential_opponents.sort(
            key=lambda o: abs(o.elo_rating - student.elo_rating) + (random.random() * 50)
        )

        return potential_opponents[:num_opponents]

    async def auto_find_players_and_create_match(
        self,
        num_players: int,
        num_rounds: int,
        student_id: str,
        db: AsyncSession
    ) -> Match:
        """Legacy method for backwards compatibility - creates a single match on demand"""
        # Get the requesting student
        student = await db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")

        # Find potential opponents within ELO range
        query = select(Student).where(
            and_(
                Student.id != student.id,
                Student.elo_rating >= student.elo_rating - self.elo_tolerance,
                Student.elo_rating <= student.elo_rating + self.elo_tolerance
            )
        )
        result = await db.execute(query)
        opponents = result.scalars().all()

        if len(opponents) < num_players - 1:
            raise ValueError(f"Could not find {num_players - 1} suitable opponents")

        # Sort by ELO proximity and add some randomness
        opponents.sort(
            key=lambda o: abs(o.elo_rating - student.elo_rating) + (random.random() * 50)
        )

        # Take the best matches
        selected_opponents = opponents[:num_players-1]
        
        # Create the match
        player_ids = [str(student.id)] + [str(o.id) for o in selected_opponents]
        match = Match(
            status=MatchStatus.PENDING,
            num_rounds=num_rounds,
            arena_id=None  # This is a standalone match, not part of an arena
        )
        db.add(match)
        await db.flush()

        # Add participants
        for pid in player_ids:
            s = await db.get(Student, pid)
            mp = MatchParticipant(
                match_id=match.id,
                student_id=pid,
                elo_before=s.elo_rating if s else 1000
            )
            db.add(mp)

        await db.commit()
        await db.refresh(match)
        return match
