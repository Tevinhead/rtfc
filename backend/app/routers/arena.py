from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from ..database import get_db
from ..models.arena_session import ArenaSession, ArenaSessionStatus, ArenaParticipant
from ..models.match import Match, MatchStatus, MatchParticipant
from ..models.student import Student
from ..models.arena_schemas import (
    CreateArenaRequest,
    StudentStatsResponse,
    ArenaSessionResponse,
    MatchResponse,
    SetMatchWinnerRequest,
    MatchWinnerResponse
)
from ..services.arena_stats_service import ArenaStatsService
from ..services.arena_match_service import ArenaMatchService

# Services
arena_stats_service = ArenaStatsService()
arena_match_service = ArenaMatchService()

router = APIRouter()

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

    # Get all arena participants
    result = await db.execute(
        select(ArenaParticipant, Student)
        .join(Student)
        .where(ArenaParticipant.arena_id == arena_id)
    )
    participant_students = result.all()
    if len(participant_students) < 2:
        raise HTTPException(status_code=400, detail="Not enough participants")

    try:
        match = await arena_match_service.create_next_match(
            db, arena_id, participant_students
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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

    # Update match and participants
    await arena_match_service.set_match_winner(
        db, match, request.winner_ids, participants_with_students
    )

    # Update arena session
    arena.rounds_completed += 1
    if arena.rounds_completed >= arena.num_rounds:
        arena.status = ArenaSessionStatus.COMPLETED

    await db.commit()
    # Ensure participants are loaded before returning
    await db.refresh(match, ['participants'])
    await db.refresh(arena)

    # Get all arena participants for stats
    result = await db.execute(
        select(ArenaParticipant, Student)
        .join(Student)
        .where(ArenaParticipant.arena_id == arena.id)
    )
    arena_participant_students = result.all()

    # Calculate stats using service
    participants_list = await arena_stats_service.calculate_arena_stats(
        db, arena.id, arena_participant_students
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

    # Calculate stats using service
    stats = await arena_stats_service.calculate_arena_stats(
        db, arena_id, participant_students
    )
    return {"data": stats}
