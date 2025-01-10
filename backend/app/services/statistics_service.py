from typing import List, Dict, Any
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.student import Student
from ..models.match import Match, MatchStatus, Round, RoundParticipant
from ..models.flashcard import Flashcard
from ..models.arena_session import ArenaSession

class StatisticsService:
    @staticmethod
    async def get_flashcard_stats(flashcard_id: str, db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive statistics for a flashcard"""
        # Get the flashcard
        flashcard = await db.get(Flashcard, flashcard_id)
        if not flashcard:
            raise ValueError("Flashcard not found")

        # Get rounds where this flashcard was used
        rounds_query = select(Round).where(Round.flashcard_id == flashcard_id)
        result = await db.execute(rounds_query)
        rounds = result.scalars().all()

        total_uses = len(rounds)
        if total_uses == 0:
            return {
                "total_uses": 0,
                "success_rate": 0,
                "average_winners": 0,
                "used_in_arenas": 0
            }

        # Calculate statistics
        total_winners = sum(len(round.winner_ids or []) for round in rounds)
        total_participants = await db.scalar(
            select(func.count(RoundParticipant.student_id))
            .where(RoundParticipant.round_id.in_([r.id for r in rounds]))
        )

        # Get unique arena sessions this flashcard was used in
        unique_arenas = await db.scalar(
            select(func.count(func.distinct(Match.arena_id)))
            .join(Round, Round.match_id == Match.id)
            .where(Round.flashcard_id == flashcard_id)
        )

        return {
            "total_uses": total_uses,
            "success_rate": round((total_winners / total_participants * 100), 1) if total_participants > 0 else 0,
            "average_winners": round(total_winners / total_uses, 2),
            "used_in_arenas": unique_arenas
        }

    @staticmethod
    async def get_most_used_flashcards(db: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
        """Get flashcards sorted by usage frequency"""
        query = (
            select(
                Flashcard,
                func.count(Round.id).label('usage_count')
            )
            .join(Round, Round.flashcard_id == Flashcard.id)
            .group_by(Flashcard.id)
            .order_by(desc('usage_count'))
            .limit(limit)
        )
        
        result = await db.execute(query)
        flashcards_with_count = result.all()

        stats = []
        for flashcard, usage_count in flashcards_with_count:
            flashcard_stats = await StatisticsService.get_flashcard_stats(flashcard.id, db)
            stats.append({
                "id": flashcard.id,
                "question": flashcard.question,
                "usage_count": usage_count,
                "success_rate": flashcard_stats["success_rate"],
                "used_in_arenas": flashcard_stats["used_in_arenas"]
            })

        return stats

    @staticmethod
    async def get_arena_flashcard_stats(arena_id: str, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get statistics for all flashcards used in a specific arena session"""
        # Verify arena exists
        arena = await db.get(ArenaSession, arena_id)
        if not arena:
            raise ValueError("Arena session not found")

        # Get all rounds in this arena's matches
        rounds_query = (
            select(Round, Flashcard)
            .join(Match, Match.id == Round.match_id)
            .join(Flashcard, Flashcard.id == Round.flashcard_id)
            .where(Match.arena_id == arena_id)
        )
        
        result = await db.execute(rounds_query)
        rounds_with_flashcards = result.all()

        stats = {}
        for round, flashcard in rounds_with_flashcards:
            if flashcard.id not in stats:
                stats[flashcard.id] = {
                    "id": flashcard.id,
                    "question": flashcard.question,
                    "times_used": 0,
                    "total_winners": 0,
                    "total_participants": 0
                }
            
            stats[flashcard.id]["times_used"] += 1
            stats[flashcard.id]["total_winners"] += len(round.winner_ids or [])
            
            # Count participants
            participant_count = await db.scalar(
                select(func.count(RoundParticipant.student_id))
                .where(RoundParticipant.round_id == round.id)
            )
            stats[flashcard.id]["total_participants"] += participant_count

        # Calculate success rates and format response
        formatted_stats = []
        for flashcard_stats in stats.values():
            success_rate = (
                round(flashcard_stats["total_winners"] / flashcard_stats["total_participants"] * 100, 1)
                if flashcard_stats["total_participants"] > 0
                else 0
            )
            formatted_stats.append({
                "id": flashcard_stats["id"],
                "question": flashcard_stats["question"],
                "times_used": flashcard_stats["times_used"],
                "success_rate": success_rate
            })

        return sorted(formatted_stats, key=lambda x: x["times_used"], reverse=True)

    @staticmethod
    async def get_student_stats(student_id: str, db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive statistics for a student"""
        # Get the student
        student = await db.get(Student, student_id)
        if not student:
            raise ValueError("Student not found")

        # Get total matches
        matches_query = select(func.count(Match.id)).where(
            ((Match.player1_id == student_id) | (Match.player2_id == student_id)) &
            (Match.status == MatchStatus.COMPLETED)
        )
        total_matches = await db.scalar(matches_query)

        # Get win rate
        wins_query = select(func.count(Match.id)).where(
            (Match.winner_id == student_id) &
            (Match.status == MatchStatus.COMPLETED)
        )
        wins = await db.scalar(wins_query)
        win_rate = (wins / total_matches * 100) if total_matches > 0 else 0

        # Get average ELO change
        elo_changes = []
        matches = await db.execute(
            select(Match).where(
                ((Match.player1_id == student_id) | (Match.player2_id == student_id)) &
                (Match.status == MatchStatus.COMPLETED)
            )
        )
        for match in matches.scalars():
            if match.player1_id == student_id:
                elo_changes.append(match.player1_elo_change or 0)
            else:
                elo_changes.append(match.player2_elo_change or 0)

        avg_elo_change = sum(elo_changes) / len(elo_changes) if elo_changes else 0

        return {
            "total_matches": total_matches,
            "wins": wins,
            "losses": total_matches - wins,
            "win_rate": round(win_rate, 1),
            "current_elo": student.elo_rating,
            "avg_elo_change": round(avg_elo_change, 1)
        }

    @staticmethod
    async def get_leaderboard(db: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top students by ELO rating"""
        query = select(Student).order_by(desc(Student.elo_rating)).limit(limit)
        result = await db.execute(query)
        students = result.scalars().all()

        leaderboard = []
        for student in students:
            stats = await StatisticsService.get_student_stats(student.id, db)
            leaderboard.append({
                "id": student.id,
                "name": student.name,
                "elo_rating": student.elo_rating,
                "win_rate": stats["win_rate"],
                "total_matches": stats["total_matches"]
            })

        return leaderboard

    @staticmethod
    async def get_match_history(
        student_id: str, db: AsyncSession, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get recent match history for a student"""
        query = select(Match).where(
            ((Match.player1_id == student_id) | (Match.player2_id == student_id)) &
            (Match.status == MatchStatus.COMPLETED)
        ).order_by(desc(Match.created_at)).limit(limit)

        result = await db.execute(query)
        matches = result.scalars().all()

        history = []
        for match in matches:
            opponent_id = match.player2_id if match.player1_id == student_id else match.player1_id
            opponent = await db.get(Student, opponent_id)
            
            elo_change = match.player1_elo_change if match.player1_id == student_id else match.player2_elo_change
            
            history.append({
                "match_id": match.id,
                "opponent_name": opponent.name,
                "opponent_rating": opponent.elo_rating,
                "won": match.winner_id == student_id,
                "elo_change": elo_change,
                "date": match.created_at
            })

        return history
