from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from ..database import Base

class DifficultyLevel(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    pack_id = Column(UUID(as_uuid=True), ForeignKey("flashcard_packs.id"), nullable=False)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    times_used = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    @property
    def success_rate(self):
        if self.times_used == 0:
            return 0.0
        return (self.times_correct / self.times_used) * 100

    def update_stats(self, correct: bool):
        """Update flashcard statistics after use"""
        self.times_used += 1
        if correct:
            self.times_correct += 1

class FlashcardPack(Base):
    __tablename__ = "flashcard_packs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
