from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Generic, TypeVar, Literal
from pydantic import BaseModel, constr, validator, ConfigDict
from datetime import datetime
from uuid import UUID

from ..database import get_db
from ..models.student import Student
from ..models.match import Match, MatchStatus, MatchParticipant
from ..models.flashcard import Flashcard
from ..models.achievement import Achievement, StudentAchievement
from ..services import achievement_service
from ..schemas.achievement import StudentAchievementResponse

T = TypeVar('T')

class DataResponse(BaseModel, Generic[T]):
    data: T
    model_config = ConfigDict(from_attributes=True)

class MatchHistoryItem(BaseModel):
    match_id: UUID
    date: datetime
    opponent_name: str
    old_elo: float
    new_elo: float
    elo_change: float
    result: Literal["win", "loss"]

    model_config = ConfigDict(from_attributes=True)

router = APIRouter(tags=["students"])

class StudentBase(BaseModel):
    name: constr(min_length=1, max_length=100)

    @validator('name')
    def no_empty_strings(cls, v):
        if not v.strip():
            raise ValueError('Cannot be empty string')
        return v.strip()

class StudentCreate(StudentBase):
    avatar_url: str | None = None  # NEW FIELD

class StudentUpdate(StudentBase):
    avatar_url: str | None = None  # NEW FIELD

class StudentResponse(StudentBase):
    id: UUID
    avatar_url: str | None = None
    elo_rating: float
    total_matches: int
    wins: int
    losses: int
    created_at: datetime
    updated_at: datetime
    win_rate: float

    class Config:
        from_attributes = True

    @validator('win_rate', pre=True, always=True)
    def calculate_win_rate(cls, v, values):
        """
        If your Student model calculates win_rate as a fraction (e.g. 0.75),
        you might want to convert to a percentage. Adjust as needed.
        """
        if hasattr(v, '__call__'):
            return 0.0
        # Or if your model already stores it as a percentage, just return v.
        # In some code, the Student model uses `win_rate = (wins / total_matches) * 100`.
        return v / 100 if v is not None else 0.0

@router.post("", response_model=DataResponse[StudentResponse], status_code=status.HTTP_201_CREATED)
async def create_student(
    student: StudentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new student"""
    db_student = Student(**student.dict())
    db.add(db_student)
    await db.commit()

    result = await db.execute(
        select(Student).where(Student.id == db_student.id)
    )
    created_student = result.scalar_one()
    return {"data": created_student}

@router.get("", response_model=DataResponse[List[StudentResponse]])
async def get_students(
    db: AsyncSession = Depends(get_db)
):
    """Get all students"""
    result = await db.execute(select(Student))
    return {"data": result.scalars().all()}

@router.get("/{student_id}", response_model=DataResponse[StudentResponse])
async def get_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific student by ID"""
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return {"data": student}

@router.put("/{student_id}", response_model=DataResponse[StudentResponse])
async def update_student(
    student_id: UUID,
    student_update: StudentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a student"""
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    db_student = result.scalar_one_or_none()
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    for field, value in student_update.dict().items():
        setattr(db_student, field, value)

    await db.commit()
    await db.refresh(db_student)
    return {"data": db_student}

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a student"""
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Delete student from round_participants table
    from sqlalchemy import text
    await db.execute(
        text("DELETE FROM round_participants WHERE student_id = :sid"),
        {"sid": str(student_id)}
    )
    # Delete student from match_participants table
    await db.execute(
        text("DELETE FROM match_participants WHERE student_id = :sid"),
        {"sid": str(student_id)}
    )
    # Delete student from arena_participants table
    await db.execute(
        text("DELETE FROM arena_participants WHERE student_id = :sid"),
        {"sid": str(student_id)}
    )

    await db.delete(student)
    await db.commit()

@router.get("/{student_id}/achievements", response_model=DataResponse[List[StudentAchievementResponse]])
async def get_student_achievements(student_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all achievements earned by a specific student."""
    # Verify student exists
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get student achievements with joined achievement data
    result = await db.execute(
        select(StudentAchievement, Achievement)
        .join(Achievement, StudentAchievement.achievement_id == Achievement.id)
        .where(StudentAchievement.student_id == student_id)
        .order_by(desc(StudentAchievement.achieved_at))
    )
    
    achievements_data = []
    for sa, achievement in result:
        achievements_data.append({
            "id": sa.id,
            "student_id": sa.student_id,
            "achievement": achievement,
            "achieved_at": sa.achieved_at
        })
    
    return {"data": achievements_data}

@router.post("/{student_id}/evaluate-achievements")
async def evaluate_student_achievements(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Evaluate achievements for a student based on their match history"""
    # Get student
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Get all matches for this student using the participants relationship
    result = await db.execute(
        select(Match)
        .join(MatchParticipant, Match.id == MatchParticipant.match_id)
        .where(MatchParticipant.student_id == student_id)
    )
    matches = result.scalars().all()

    print(f"[Achievement Debug] Evaluating achievements for existing student {student_id}")
    print(f"[Achievement Debug] Found {len(matches)} matches to evaluate")
    
    # Evaluate achievements
    newly_earned = await achievement_service.evaluate_student_achievements(student, matches, db)
    
    return {
        "data": {
            "evaluated_matches": len(matches),
            "new_achievements": len(newly_earned),
            "achievement_codes": [a.code for a in newly_earned]
        }
    }

@router.get("/{student_id}/stats", response_model=DataResponse[StudentResponse])
async def get_student_stats(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a student's updated stats"""
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return {"data": student}

@router.post("/{student_id}/reset", response_model=DataResponse[StudentResponse])
async def reset_student_stats(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset the specified student's statistics to default values,
    and remove all match history (match_participants, round_participants).
    """
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # 1) Remove match history
    #    Remove all RoundParticipants and MatchParticipants rows for this student
    from sqlalchemy import text
    await db.execute(
        text("DELETE FROM round_participants WHERE student_id = :sid"),
        {"sid": str(student_id)}
    )
    await db.execute(
        text("DELETE FROM match_participants WHERE student_id = :sid"),
        {"sid": str(student_id)}
    )

    # 2) Reset fields to default values
    student.elo_rating = 1000.0
    student.wins = 0
    student.losses = 0
    student.total_matches = 0

    await db.commit()
    await db.refresh(student)

    return {"data": student}

@router.get("/{student_id}/history", response_model=DataResponse[List[MatchHistoryItem]])
async def get_student_history(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Return match history for a student, including ELO changes and results,
    adapting to the new participant-based match schema.
    """
    # 1) Verify student exists
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2) Query all matches in which this student participated
    stmt = (
        select(Match)
        .join(MatchParticipant, Match.id == MatchParticipant.match_id)
        .options(
            # preload the participants -> student relationship
            selectinload(Match.participants).selectinload(MatchParticipant.student)
        )
        .where(MatchParticipant.student_id == student_id)
        .order_by(Match.created_at.desc())
    )
    results = await db.execute(stmt)
    matches = results.scalars().all()

    history_items: List[MatchHistoryItem] = []

    for match in matches:
        # find the participant object for this student
        user_participant = None
        # for a 1v1 match, there's typically exactly 1 "opponent", but for multi-player, there may be multiple
        opponents = []
        for p in match.participants:
            if p.student_id == student_id:
                user_participant = p
            else:
                opponents.append(p)

        if not user_participant:
            # Should not happen if query is correct, but skip if something's off
            continue

        old_elo = user_participant.elo_before or 0.0
        new_elo = user_participant.elo_after or old_elo
        elo_change = new_elo - old_elo

        # Only show completed matches with winners
        if match.status != MatchStatus.COMPLETED or not match.winner_ids or len(match.winner_ids) == 0:
            continue
            
        # Determine win/loss
        result_str = "win" if user_participant.student_id in match.winner_ids else "loss"

        # For "opponent_name", pick the first opponent if any
        opponent_name = "Unknown"
        if len(opponents) > 0 and opponents[0].student:
            opponent_name = opponents[0].student.name

        history_items.append(
            MatchHistoryItem(
                match_id=match.id,
                date=match.created_at,
                opponent_name=opponent_name,
                old_elo=old_elo,
                new_elo=new_elo,
                elo_change=elo_change,
                result=result_str
            )
        )

    return {"data": history_items}
