from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from uuid import UUID
from ..database import get_db
from ..services.statistics_service import StatisticsService

router = APIRouter()

@router.get("/flashcards/{flashcard_id}/stats")
async def get_flashcard_stats(
    flashcard_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get comprehensive statistics for a specific flashcard"""
    try:
        stats = await StatisticsService.get_flashcard_stats(str(flashcard_id), db)
        return {"data": stats}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/flashcards/most-used")
async def get_most_used_flashcards(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, List[Dict[str, Any]]]:
    """Get flashcards sorted by usage frequency"""
    stats = await StatisticsService.get_most_used_flashcards(db, limit)
    return {"data": stats}

@router.get("/arena/{arena_id}/flashcard-stats")
async def get_arena_flashcard_stats(
    arena_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, List[Dict[str, Any]]]:
    """Get statistics for all flashcards used in a specific arena session"""
    try:
        stats = await StatisticsService.get_arena_flashcard_stats(str(arena_id), db)
        return {"data": stats}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
