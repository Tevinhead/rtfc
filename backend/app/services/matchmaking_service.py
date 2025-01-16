# backend/app/services/matchmaking_service.py

from typing import List, Optional, Tuple, Dict
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
import random
import math
from datetime import datetime, timedelta, timezone

from ..models.student import Student
from ..models.match import Match, MatchParticipant, MatchStatus
from ..models.arena_session import ArenaParticipant
from .elo_service import EloService


class MatchmakingService:
    """
    A robust matchmaking service that:
      1) Ensures each participant gets a roughly equal number of matches
      2) Prefers matching players with similar ELO ratings (plus some randomness)
      3) Avoids re-matching the same pair unless absolutely necessary
      4) Supports a round-based approach so that everyone is assigned consistently
    """

    def __init__(
        self,
        k_factor: int = 32,
        elo_tolerance: int = 300,
        random_seed: Optional[int] = None
    ):
        """
        Initialize matchmaking service
        :param k_factor: ELO k-factor used in rating calculations
        :param elo_tolerance: ELO difference in which we treat players as "close"
        :param random_seed: Optional seed for reproducible results in testing
        """
        self.elo_service = EloService(k_factor)
        self.elo_tolerance = elo_tolerance
        if random_seed is not None:
            random.seed(random_seed)

    async def find_or_create_match_schedule(
        self,
        db: AsyncSession,
        arena_id: str,
        participants: List[ArenaParticipant],
        total_matches: int,
    ) -> None:
        """
        Generate and store a complete match schedule for the arena.
        total_matches = (len(participants)//2) * num_rounds, typically.
        """
        # Step 1: Generate matchups round-by-round
        matchups = await self.generate_match_schedule(db, arena_id, participants, total_matches)

        # Step 2: Store them in the DB
        await self.store_generated_matches(db, arena_id, matchups)

    async def generate_match_schedule(
        self,
        db: AsyncSession,
        arena_id: str,
        participants: List[ArenaParticipant],
        total_matches: int,
    ) -> List[Tuple[str, str]]:
        """
        Generates a schedule of matchups using a **round-based** approach, ensuring:
          - Each participant gets ~the same number of matches
          - We prefer pairing players with similar ELO
          - We avoid reusing pairs if possible
        """

        # Gather participant info including ELO ratings
        p_info = []
        for ap in participants:
            student = ap.student
            p_info.append({
                "student_id": str(student.id),
                "elo": student.elo_rating,
                "fights_played": ap.fights_played,  # how many they've already done
                "remaining": 0,  # we'll fill this in below
            })

        n = len(p_info)
        if n < 2:
            return []  # can't form matches

        # Calculate how many "slots" total we have for matches (2 participants per match)
        total_slots = total_matches * 2
        # Distribute matches as evenly as possible among participants
        base_needed = total_slots // n  # e.g. if total_slots=60, n=14 => base_needed=4
        remainder = total_slots % n     # leftover

        for idx in range(n):
            p_info[idx]["remaining"] = base_needed + (1 if idx < remainder else 0)

        # We aim to build up to total_matches in a round-based manner
        # Each round we form at most floor(n/2) new matches
        # We'll keep track of used pairs to avoid repeats
        matched_pairs = set()
        schedule = []

        # We'll keep forming matches round-by-round until:
        #   - we've formed all total_matches, OR
        #   - no one can be paired further
        formed_matches = 0
        round_number = 0
        max_rounds = 4 * total_matches  # safety cap so we don't get stuck forever

        while formed_matches < total_matches and round_number < max_rounds:
            round_number += 1

            # 1) Filter only those who still can fight
            candidates = [p for p in p_info if p["remaining"] > 0]
            # If not enough to form at least 1 match, break
            if len(candidates) < 2:
                break

            # 2) Sort by (#remaining desc, ELO proximity) or random factor
            #    to pair up players who are close in ELO but also balancing usage
            #    We'll do: sort by remaining desc => try to ensure those who have a lot
            #    of matches left go first. Then sub-sort by ELO. Then random perturb.
            def sorting_key(p):
                return (-p["remaining"], p["elo"])

            # Slight random shuffle, but stable with main key
            candidates.sort(key=sorting_key)
            # We'll do a small random shuffle "inside" the sorted list to avoid monotony
            # e.g. shuffle 3 or 4 neighbors:
            for i in range(0, len(candidates), 3):
                slice_end = min(i+3, len(candidates))
                sub = candidates[i:slice_end]
                random.shuffle(sub)
                candidates[i:slice_end] = sub

            used_in_this_round = set()
            i = 0
            round_pairs = []

            # 3) Greedily form pairs from front to back
            while i < len(candidates) - 1:
                p1 = candidates[i]
                if p1["remaining"] <= 0:
                    i += 1
                    continue

                # Find a partner j
                # We'll do a small linear search from i+1 forward
                pair_index = -1
                for j in range(i+1, len(candidates)):
                    p2 = candidates[j]
                    if p2["remaining"] > 0:
                        # check if pair is already used
                        pair_tuple = tuple(sorted([p1["student_id"], p2["student_id"]]))
                        if pair_tuple not in matched_pairs:
                            pair_index = j
                            break
                # If we found no new pair, try again but allow repeated pairs if needed
                if pair_index < 0:
                    for j in range(i+1, len(candidates)):
                        p2 = candidates[j]
                        if p2["remaining"] > 0:
                            pair_index = j
                            break

                if pair_index < 0:
                    # can't pair p1, move on
                    i += 1
                    continue

                # form the pair
                p2 = candidates[pair_index]
                pair_tuple = tuple(sorted([p1["student_id"], p2["student_id"]]))

                # reduce their remaining slots
                p1["remaining"] -= 1
                p2["remaining"] -= 1
                # store the pair
                round_pairs.append(pair_tuple)
                matched_pairs.add(pair_tuple)
                formed_matches += 1

                # We remove p2 from the list so we don't attempt to re-pair them
                # but keep p1 in case there's a next round
                candidates.pop(pair_index)
                # move i forward
                i += 1

                # If we've formed enough total matches, break early
                if formed_matches >= total_matches:
                    break

            # commit these pairs to the schedule
            for pr in round_pairs:
                schedule.append(pr)

            if len(round_pairs) == 0:
                # no pairs formed => break to avoid infinite loop
                break

        # Done forming matches
        return schedule

    async def store_generated_matches(
        self,
        db: AsyncSession,
        arena_id: str,
        matchups: List[Tuple[str, str]],
    ) -> None:
        """Store generated match schedule in database, each matchup => 1 match with 2 participants."""
        for (p1, p2) in matchups:
            new_match = Match(
                arena_id=arena_id,
                status=MatchStatus.PENDING,
                num_rounds=1,
                rounds_completed=0,
            )
            db.add(new_match)
            await db.flush()

            # Grab current ELO
            s1 = await db.get(Student, p1)
            s2 = await db.get(Student, p2)
            e1 = s1.elo_rating if s1 else 1000
            e2 = s2.elo_rating if s2 else 1000

            mp1 = MatchParticipant(
                match_id=new_match.id,
                student_id=p1,
                elo_before=e1
            )
            mp2 = MatchParticipant(
                match_id=new_match.id,
                student_id=p2,
                elo_before=e2
            )
            db.add_all([mp1, mp2])

        await db.commit()

    async def get_recent_opponents(
        self,
        student_id: str,
        db: AsyncSession,
    ) -> Dict[str, datetime]:
        """
        Returns a map of {opponent_id: last_time_they_played_with_student_id} for recently played matches.
        You can keep or remove this if not used.
        """
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=3)
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
            opp_id = str(participant.student_id)
            match_time = match.created_at
            if opp_id not in recent_opponents or match_time > recent_opponents[opp_id]:
                recent_opponents[opp_id] = match_time
        return recent_opponents

    async def find_match(
        self,
        student_id: str,
        db: AsyncSession
    ) -> Optional[Match]:
        """
        Finds an existing pending match for the student.
        You can keep or remove this if not used.
        """
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
        """
        Find suitable opponents for a single match, based on ELO range.
        This is an older method you can keep for one-off usage or remove if not needed.
        """
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
        """
        Legacy method. Creates a single match on-demand with similar ELO players.
        If you rely on this, keep it. Otherwise, remove it. 
        """
        student = await db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")

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

        opponents.sort(
            key=lambda o: abs(o.elo_rating - student.elo_rating) + (random.random() * 50)
        )
        selected_opponents = opponents[:num_players-1]
        
        # Create the match
        match = Match(
            status=MatchStatus.PENDING,
            num_rounds=num_rounds,
            arena_id=None  # standalone
        )
        db.add(match)
        await db.flush()

        # Add participants
        player_ids = [str(student.id)] + [str(o.id) for o in selected_opponents]
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
