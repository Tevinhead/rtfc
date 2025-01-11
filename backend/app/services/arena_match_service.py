from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from uuid import UUID
import uuid

from ..models.arena_session import ArenaSession, ArenaSessionStatus, ArenaParticipant
from ..models.match import Match, MatchStatus, MatchParticipant
from ..models.student import Student
from ..models.arena_schemas import MatchResponse
from .elo_service import EloService
from .matchmaking_service import MatchmakingService

class ArenaMatchService:
    def __init__(self):
        self.elo_service = EloService()
        self.matchmaking_service = MatchmakingService()

    async def create_next_match(
        self,
        db: AsyncSession,
        arena_id: UUID,
        participant_students: List[Tuple[ArenaParticipant, Student]]
    ) -> Match:
        """Create the next match in an arena session"""
        if len(participant_students) < 2:
            raise ValueError("Not enough participants")

        # Find the participant with least fights to be the initiator
        participant_students.sort(key=lambda ps: ps[0].fights_played)
        initiator_participant, initiator_student = participant_students[0]
        
        # Get potential opponents from current arena participants
        potential_opponents = []
        for participant, student in participant_students[1:]:  # Skip initiator
            potential_opponents.append(student)
        
        # Use matchmaking service to find best opponent
        opponents = await self.matchmaking_service.find_opponents(
            initiator_student, 2, db, potential_opponents
        )
        if not opponents:
            raise ValueError("No suitable opponents found")
            
        # Find the opponent's participant record
        opponent_student = opponents[0]
        opponent_participant = next(
            participant for participant, student in participant_students[1:]
            if str(student.id) == str(opponent_student.id)
        )

        # Create match
        match = Match(
            arena_id=arena_id,
            status=MatchStatus.IN_PROGRESS,
            num_rounds=1  # Each match is one round
        )
        db.add(match)
        await db.flush()

        # Create participants
        mp1 = MatchParticipant(
            match_id=match.id,
            student_id=initiator_student.id,
            elo_before=initiator_student.elo_rating
        )
        mp2 = MatchParticipant(
            match_id=match.id,
            student_id=opponent_student.id,
            elo_before=opponent_student.elo_rating
        )
        db.add_all([mp1, mp2])

        # Increment fights_played
        initiator_participant.fights_played += 1
        opponent_participant.fights_played += 1

        return match

    async def set_match_winner(
        self,
        db: AsyncSession,
        match: Match,
        winner_ids: List[UUID],
        participants_with_students: List[Tuple[MatchParticipant, Student]]
    ) -> None:
        """Set the winner of a match and update ELO ratings"""
        # Convert winner IDs to UUID objects and store on match
        match.winner_ids = [uuid.UUID(str(winner_id)) for winner_id in winner_ids]

        # Update all participants
        for participant, student in participants_with_students:
            is_winner = student.id in winner_ids
            elo_change = 0
            
            # Calculate ELO changes against each opponent
            for other_participant, other_student in participants_with_students:
                if other_participant.student_id != participant.student_id:
                    if is_winner:
                        winner_change, _ = self.elo_service.calculate_rating_changes(
                            student.elo_rating,
                            other_student.elo_rating
                        )
                        elo_change += winner_change
                    else:
                        _, loser_change = self.elo_service.calculate_rating_changes(
                            other_student.elo_rating,
                            student.elo_rating
                        )
                        elo_change += loser_change

            # Update participant and student stats
            participant.elo_after = participant.elo_before + elo_change
            student.update_stats(
                won=is_winner,
                new_elo=student.elo_rating + elo_change
            )

        # Update match status
        match.status = MatchStatus.COMPLETED
