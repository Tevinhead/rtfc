from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.match import Match, MatchStatus, MatchParticipant
from ..models.arena_session import ArenaParticipant
from ..models.student import Student
from ..models.arena_schemas import StudentStatsResponse
from typing import List, Tuple
from uuid import UUID

class ArenaStatsService:
    @staticmethod
    async def calculate_participant_stats(
        db: AsyncSession,
        arena_id: UUID,
        participant: ArenaParticipant,
        student: Student
    ) -> StudentStatsResponse:
        """Calculate stats for a single participant in an arena session"""
        # Get matches where student participated
        result = await db.execute(
            select(Match, MatchParticipant)
            .join(MatchParticipant)
            .where(
                (Match.arena_id == arena_id) &
                (MatchParticipant.student_id == student.id) &
                (Match.status == MatchStatus.COMPLETED)
            )
        )
        matches = result.all()
        
        # Calculate wins, losses and elo change
        wins = 0
        losses = 0
        elo_change = 0
        for match, match_participant in matches:
            if match.status == MatchStatus.COMPLETED:
                elo_change += (match_participant.elo_after or 0) - match_participant.elo_before
                # Count match-level wins/losses
                # Only count wins/losses if there was a winner (not UNKNOWN)
                if match.winner_ids:
                    if match_participant.student_id in match.winner_ids:
                        wins += 1
                    else:
                        losses += 1

        return StudentStatsResponse(
            student_id=student.id,
            name=student.name,
            elo_rating=student.elo_rating,
            wins=wins,
            losses=losses,
            fights_played=participant.fights_played,
            elo_change=elo_change
        )

    @staticmethod
    async def calculate_arena_stats(
        db: AsyncSession,
        arena_id: UUID,
        participant_students: List[Tuple[ArenaParticipant, Student]]
    ) -> List[StudentStatsResponse]:
        """Calculate stats for all participants in an arena session"""
        stats = []
        for participant, student in participant_students:
            stat = await ArenaStatsService.calculate_participant_stats(
                db, arena_id, participant, student
            )
            stats.append(stat)
        
        # Sort by ELO rating descending
        stats.sort(key=lambda x: x.elo_rating, reverse=True)
        return stats
