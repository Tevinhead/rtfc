from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, conlist
from ..database import get_db
from ..models.arena_session import ArenaSession, ArenaSessionStatus, ArenaParticipant
from ..models.match import Match, MatchStatus, MatchParticipant
from ..models.student import Student
from ..services.elo_service import EloService

# Request/Response Models
class CreateArenaRequest(BaseModel):
    student_ids: conlist(UUID, min_length=2)  # At least 2 players required
    num_rounds: int

class StudentStatsResponse(BaseModel):
    student_id: UUID
    name: str
    elo_rating: float
    wins: int
    losses: int
    fights_played: int
    elo_change: float  # Total ELO change in this arena session

    class Config:
        from_attributes = True

class ArenaSessionResponse(BaseModel):
    id: UUID
    status: ArenaSessionStatus
    num_rounds: int
    rounds_completed: int
    participants: List[StudentStatsResponse]

    class Config:
        from_attributes = True

class MatchParticipantResponse(BaseModel):
    student_id: UUID
    elo_before: float
    elo_after: Optional[float]

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: UUID
    status: MatchStatus
    num_rounds: int
    rounds_completed: int
    participants: List[MatchParticipantResponse]

    class Config:
        from_attributes = True

class SetMatchWinnerRequest(BaseModel):
    winner_ids: List[UUID]

router = APIRouter()
elo_service = EloService()

@router.post("", response_model=dict[str, ArenaSessionResponse])
async def create_arena_session(
    request: CreateArenaRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new arena session with the specified students"""
    # Verify all students exist
    result = await db.execute(
        select(Student).where(Student.id.in_(request.student_ids))
    )
    students = result.scalars().all()
    if len(students) != len(request.student_ids):
        raise HTTPException(status_code=400, detail="One or more students not found")

    # Create arena session
    arena = ArenaSession(
        status=ArenaSessionStatus.IN_PROGRESS,
        num_rounds=request.num_rounds,
        rounds_completed=0
    )
    db.add(arena)
    await db.flush()  # Get arena.id

    # Add participants
    for student_id in request.student_ids:
        participant = ArenaParticipant(
            arena_id=arena.id,
            student_id=student_id,
            fights_played=0
        )
        db.add(participant)

    await db.commit()
    await db.refresh(arena)

    # Construct proper response with student stats
    participants_list = []
    for participant in arena.participants:
        student = participant.student  # Already loaded due to lazy="selectin"
        participants_list.append(
            StudentStatsResponse(
                student_id=student.id,
                name=student.name,
                elo_rating=student.elo_rating,
                wins=0,  # New arena, no wins yet
                losses=0,  # New arena, no losses yet
                fights_played=0,  # New arena, no fights yet
                elo_change=0.0  # New arena, no ELO changes yet
            )
        )

    response = ArenaSessionResponse(
        id=arena.id,
        status=arena.status,
        num_rounds=arena.num_rounds,
        rounds_completed=arena.rounds_completed,
        participants=participants_list
    )
    
    return {"data": response}

@router.get("/{arena_id}/next-match", response_model=dict[str, MatchResponse])
async def get_next_match(
    arena_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get or create the next match in the arena session"""
    # Get arena session
    arena = await db.get(ArenaSession, arena_id)
    if not arena:
        raise HTTPException(status_code=404, detail="Arena session not found")
    if arena.status != ArenaSessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Arena session is not in progress")
    if arena.rounds_completed >= arena.num_rounds:
        raise HTTPException(status_code=400, detail="All rounds completed")

    # Get participants with least fights
    result = await db.execute(
        select(ArenaParticipant)
        .where(ArenaParticipant.arena_id == arena_id)
        .order_by(ArenaParticipant.fights_played)
    )
    participants = result.scalars().all()
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Not enough participants")

    # Get students for ELO ratings
    student_ids = [p.student_id for p in participants[:2]]
    result = await db.execute(
        select(Student).where(Student.id.in_(student_ids))
    )
    students = {s.id: s for s in result.scalars().all()}

    # Create match
    match = Match(
        arena_id=arena_id,
        status=MatchStatus.IN_PROGRESS,
        num_rounds=1  # Each match is one round
    )
    db.add(match)
    await db.flush()  # Get match.id

    # Create participants
    mp1 = MatchParticipant(
        match_id=match.id,
        student_id=participants[0].student_id,
        elo_before=students[participants[0].student_id].elo_rating
    )
    mp2 = MatchParticipant(
        match_id=match.id,
        student_id=participants[1].student_id,
        elo_before=students[participants[1].student_id].elo_rating
    )
    db.add_all([mp1, mp2])

    # Increment fights_played
    participants[0].fights_played += 1
    participants[1].fights_played += 1

    await db.commit()
    # Refresh match with eager loading
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.participants))
        .where(Match.id == match.id)
    )
    match = result.scalar_one()
    match_response = MatchResponse.from_orm(match)
    return {"data": match_response}

class MatchWinnerResponse(BaseModel):
    match: MatchResponse
    arena_session: ArenaSessionResponse

    class Config:
        from_attributes = True

@router.patch("/matches/{match_id}/winner", response_model=dict[str, MatchWinnerResponse])
async def set_match_winner(
    match_id: UUID,
    request: SetMatchWinnerRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set the winner of a match and update ELO ratings"""
    # Get match with participants eager loaded
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.participants))
        .where(Match.id == match_id)
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != MatchStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Match is not in progress")

    # Get match participants
    result = await db.execute(
        select(MatchParticipant, Student)
        .join(Student, MatchParticipant.student_id == Student.id)
        .where(MatchParticipant.match_id == match_id)
    )
    participants_with_students = result.all()
    if len(participants_with_students) != 2:
        raise HTTPException(status_code=400, detail="Match must have exactly 2 participants")

    # Validate winners
    participant_dict = {p.student_id: (p, s) for p, s in participants_with_students}
    for winner_id in request.winner_ids:
        if winner_id not in participant_dict:
            raise HTTPException(status_code=400, detail="Winner must be a player in this match")

    # Get arena session
    arena = await db.get(ArenaSession, match.arena_id)
    if not arena:
        raise HTTPException(status_code=404, detail="Arena session not found")

    # Store winner IDs on match
    match.winner_ids = request.winner_ids

    # Update all participants
    for participant, student in participants_with_students:
        is_winner = student.id in request.winner_ids
        elo_change = 0
        
        # Calculate ELO changes against each opponent
        for other_participant, other_student in participants_with_students:
            if other_participant.student_id != participant.student_id:
                if is_winner:
                    winner_change, _ = elo_service.calculate_rating_changes(
                        student.elo_rating,
                        other_student.elo_rating
                    )
                    elo_change += winner_change
                else:
                    _, loser_change = elo_service.calculate_rating_changes(
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

    # Update arena session
    arena.rounds_completed += 1
    if arena.rounds_completed >= arena.num_rounds:
        arena.status = ArenaSessionStatus.COMPLETED

    await db.commit()
    # Ensure participants are loaded before returning
    await db.refresh(match, ['participants'])
    await db.refresh(arena)

    # Construct arena session response
    participants_list = []
    for arena_participant in arena.participants:
        student = arena_participant.student
        # Get matches where student participated
        result = await db.execute(
            select(Match, MatchParticipant)
            .join(MatchParticipant)
            .where(
                (Match.arena_id == arena.id) &
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
                if match.winner_ids and match_participant.student_id in match.winner_ids:
                    wins += 1
                else:
                    losses += 1

        participants_list.append(
            StudentStatsResponse(
                student_id=student.id,
                name=student.name,
                elo_rating=student.elo_rating,
                wins=wins,
                losses=losses,
                fights_played=arena_participant.fights_played,
                elo_change=elo_change
            )
        )

    arena_response = ArenaSessionResponse(
        id=arena.id,
        status=arena.status,
        num_rounds=arena.num_rounds,
        rounds_completed=arena.rounds_completed,
        participants=participants_list
    )

    # Convert match to MatchResponse
    match_response = MatchResponse.from_orm(match)

    return {
        "data": MatchWinnerResponse(
            match=match_response,
            arena_session=arena_response
        )
    }

@router.get("/{arena_id}/results", response_model=dict[str, List[StudentStatsResponse]])
async def get_arena_results(
    arena_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get final results and statistics for an arena session"""
    # Get arena session
    arena = await db.get(ArenaSession, arena_id)
    if not arena:
        raise HTTPException(status_code=404, detail="Arena session not found")

    # Get all participants with their students
    result = await db.execute(
        select(ArenaParticipant, Student)
        .join(Student, ArenaParticipant.student_id == Student.id)
        .where(ArenaParticipant.arena_id == arena_id)
    )
    participant_students = result.all()

    # Calculate stats for each student
    stats = []
    for arena_participant, student in participant_students:
        # Get matches where student participated
        result = await db.execute(
            select(Match, MatchParticipant)
            .join(MatchParticipant)
            .options(selectinload(Match.rounds))
            .where(
                (Match.arena_id == arena_id) &
                (MatchParticipant.student_id == student.id)
            )
        )
        match_participants = result.all()

        # Calculate total ELO change and match-level wins/losses
        elo_change = 0
        wins = 0
        losses = 0
        for match, match_participant in match_participants:
            if match.status == MatchStatus.COMPLETED:
                elo_change += (match_participant.elo_after or 0) - match_participant.elo_before
                # Count match-level wins/losses
                if match.winner_ids and student.id in match.winner_ids:
                    wins += 1
                else:
                    losses += 1

        stats.append(StudentStatsResponse(
            student_id=student.id,
            name=student.name,
            elo_rating=student.elo_rating,
            wins=wins,
            losses=losses,
            fights_played=arena_participant.fights_played,
            elo_change=elo_change
        ))

    # Sort by ELO rating descending
    stats.sort(key=lambda x: x.elo_rating, reverse=True)
    return {"data": stats}
