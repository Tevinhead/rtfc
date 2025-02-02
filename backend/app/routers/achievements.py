from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.achievement import Achievement, StudentAchievement
from app.schemas.achievement import AchievementResponse, StudentAchievementResponse
from app.services import achievement_service
from sqlalchemy.future import select
from typing import List
from uuid import UUID

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("/", response_model=List[AchievementResponse])
async def get_achievements(db: AsyncSession = Depends(get_db)):
    """Get all available achievements."""
    achievements = await achievement_service.get_all_achievements(db)
    return achievements

@router.get("/students/{student_id}", response_model=List[StudentAchievementResponse])
async def get_student_achievements(student_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all achievements earned by a specific student."""
    # Verify student exists
    student_achievements = await achievement_service.get_student_achievements(student_id, db)
    
    # Load the full achievement data for each student achievement
    result = []
    for sa in student_achievements:
        achievement = await db.get(Achievement, sa.achievement_id)
        if achievement:
            result.append({
                "id": sa.id,
                "student_id": sa.student_id,
                "achievement": achievement,
                "achieved_at": sa.achieved_at
            })
    
    return result
