from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional, Generic, TypeVar

T = TypeVar('T')
from pydantic import BaseModel, constr, validator
import csv
import io
from datetime import datetime
from uuid import UUID

from ..database import get_db
from ..models.flashcard import Flashcard, FlashcardPack, DifficultyLevel

router = APIRouter(tags=["flashcards"])

# Response schemas
class ApiResponse(BaseModel, Generic[T]):
    data: T

# Pack schemas
class FlashcardPackBase(BaseModel):
    name: constr(min_length=1, max_length=100)

    @validator('name')
    def no_empty_strings(cls, v):
        if not v.strip():
            raise ValueError('Cannot be empty string')
        return v.strip()

class FlashcardPackCreate(FlashcardPackBase):
    pass

class FlashcardPackUpdate(FlashcardPackBase):
    pass

class FlashcardPackResponse(FlashcardPackBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FlashcardBase(BaseModel):
    question: constr(min_length=1, max_length=1000)
    answer: constr(min_length=1, max_length=1000)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    pack_id: UUID

    @validator('question', 'answer')
    def no_empty_strings(cls, v):
        if not v.strip():
            raise ValueError('Cannot be empty string')
        return v.strip()

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardUpdate(FlashcardBase):
    pass

class FlashcardResponse(FlashcardBase):
    id: UUID
    times_used: int
    times_correct: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FlashcardBulkCreate(BaseModel):
    question: constr(min_length=1, max_length=1000)
    answer: constr(min_length=1, max_length=1000)
    difficulty: Optional[DifficultyLevel] = DifficultyLevel.MEDIUM
    pack_id: UUID

    @validator('question', 'answer')
    def no_empty_strings(cls, v):
        if not v.strip():
            raise ValueError('Cannot be empty string')
        return v.strip()

class BulkImportResponse(BaseModel):
    total: int
    successful: int
    failed: int
    errors: List[str]

class TemplateResponse(BaseModel):
    content: str
    filename: str
    media_type: str

# Pack endpoints
@router.get("/packs", response_model=ApiResponse[List[FlashcardPackResponse]])
async def get_packs(
    db: AsyncSession = Depends(get_db)
):
    """Get all flashcard packs"""
    result = await db.execute(select(FlashcardPack))
    return {"data": result.scalars().all()}

@router.post("/packs", response_model=ApiResponse[FlashcardPackResponse], status_code=status.HTTP_201_CREATED)
async def create_pack(
    pack: FlashcardPackCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new flashcard pack"""
    db_pack = FlashcardPack(**pack.dict())
    db.add(db_pack)
    await db.commit()
    await db.refresh(db_pack)
    return {"data": db_pack}

@router.put("/packs/{pack_id}", response_model=ApiResponse[FlashcardPackResponse])
async def update_pack(
    pack_id: UUID,
    pack_update: FlashcardPackUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a flashcard pack"""
    result = await db.execute(
        select(FlashcardPack).where(FlashcardPack.id == pack_id)
    )
    db_pack = result.scalar_one_or_none()
    if not db_pack:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pack not found"
        )
    
    # Update fields
    for field, value in pack_update.dict().items():
        setattr(db_pack, field, value)
    
    await db.commit()
    await db.refresh(db_pack)
    return {"data": db_pack}

@router.delete("/packs/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pack(
    pack_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a flashcard pack and all its flashcards"""
    result = await db.execute(
        select(FlashcardPack).where(FlashcardPack.id == pack_id)
    )
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pack not found"
        )
    
    # Delete all flashcards in the pack
    await db.execute(
        delete(Flashcard).where(Flashcard.pack_id == pack_id)
    )
    
    # Delete the pack
    await db.delete(pack)
    await db.commit()

# Template and export endpoints
@router.post("/template", response_model=ApiResponse[TemplateResponse])
async def get_csv_template():
    """Get a CSV template for bulk flashcard import"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['question', 'answer', 'difficulty', 'pack_id'])
    writer.writerow(['What is 2+2?', '4', 'EASY', 'pack-uuid-here'])
    
    return {"data": {
        "content": output.getvalue(),
        "filename": "flashcard_template.csv",
        "media_type": "text/csv"
    }}

@router.get("/export/{pack_id}", response_model=ApiResponse[TemplateResponse])
async def export_flashcards(
    pack_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Export all flashcards from a pack as CSV"""
    # Verify pack exists
    pack = await db.execute(
        select(FlashcardPack).where(FlashcardPack.id == pack_id)
    )
    if not pack.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Get all flashcards in pack
    result = await db.execute(
        select(Flashcard).where(Flashcard.pack_id == pack_id)
    )
    flashcards = result.scalars().all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['question', 'answer', 'difficulty', 'pack_id', 'times_used', 'times_correct'])
    
    for card in flashcards:
        writer.writerow([
            card.question,
            card.answer,
            card.difficulty.name,
            str(card.pack_id),
            card.times_used,
            card.times_correct
        ])
    
    return {"data": {
        "content": output.getvalue(),
        "filename": f"flashcards_pack_{pack_id}.csv",
        "media_type": "text/csv"
    }}

@router.post("/bulk-import", response_model=BulkImportResponse)
async def bulk_import_flashcards(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Import multiple flashcards from a CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    text_content = content.decode('utf-8-sig')
    csv_reader = csv.DictReader(io.StringIO(text_content))
    
    total = 0
    successful = 0
    failed = 0
    errors = []
    flashcards_to_add = []

    try:
        for row in csv_reader:
            total += 1
            try:
                # Validate row data
                flashcard_data = FlashcardBulkCreate(
                    question=row['question'],
                    answer=row['answer'],
                    difficulty=DifficultyLevel[row.get('difficulty', 'MEDIUM').upper()],
                    pack_id=UUID(row['pack_id'])
                )
                
                # Verify pack exists
                pack = await db.execute(
                    select(FlashcardPack).where(FlashcardPack.id == flashcard_data.pack_id)
                )
                if not pack.scalar_one_or_none():
                    raise ValueError(f"Pack with ID {flashcard_data.pack_id} not found")
                
                # Create flashcard model instance
                flashcard = Flashcard(
                    question=flashcard_data.question,
                    answer=flashcard_data.answer,
                    difficulty=flashcard_data.difficulty,
                    pack_id=flashcard_data.pack_id
                )
                flashcards_to_add.append(flashcard)
                successful += 1
                
            except Exception as e:
                failed += 1
                errors.append(f"Row {total}: {str(e)}")
                
        # Bulk insert valid flashcards
        if flashcards_to_add:
            db.add_all(flashcards_to_add)
            await db.commit()
            
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "total": total,
        "successful": successful,
        "failed": failed,
        "errors": errors
    }

# Basic CRUD endpoints
@router.get("/pack/{pack_id}", response_model=ApiResponse[List[FlashcardResponse]])
async def get_flashcards_by_pack(
    pack_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get all flashcards in a pack"""
    result = await db.execute(
        select(Flashcard).where(Flashcard.pack_id == pack_id)
    )
    return {"data": result.scalars().all()}

@router.get("/all", response_model=ApiResponse[List[FlashcardResponse]])
async def get_flashcards(
    db: AsyncSession = Depends(get_db)
):
    """Get all flashcards"""
    result = await db.execute(select(Flashcard))
    return {"data": result.scalars().all()}

@router.post("/", response_model=ApiResponse[FlashcardResponse], status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    flashcard: FlashcardCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new flashcard"""
    # Verify pack exists
    pack = await db.execute(
        select(FlashcardPack).where(FlashcardPack.id == flashcard.pack_id)
    )
    if not pack.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pack with ID {flashcard.pack_id} not found"
        )
    
    db_flashcard = Flashcard(**flashcard.dict())
    db.add(db_flashcard)
    await db.commit()
    await db.refresh(db_flashcard)
    return {"data": db_flashcard}

@router.get("/{flashcard_id}", response_model=ApiResponse[FlashcardResponse])
async def get_flashcard(
    flashcard_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific flashcard by ID"""
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id)
    )
    flashcard = result.scalar_one_or_none()
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return {"data": flashcard}

@router.put("/{flashcard_id}", response_model=ApiResponse[FlashcardResponse])
async def update_flashcard(
    flashcard_id: UUID,
    flashcard_update: FlashcardUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a flashcard"""
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id)
    )
    db_flashcard = result.scalar_one_or_none()
    if not db_flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    # Update fields
    for field, value in flashcard_update.dict().items():
        setattr(db_flashcard, field, value)
    
    await db.commit()
    await db.refresh(db_flashcard)
    return {"data": db_flashcard}

@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    flashcard_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a flashcard"""
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == flashcard_id)
    )
    flashcard = result.scalar_one_or_none()
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    await db.delete(flashcard)
    await db.commit()
