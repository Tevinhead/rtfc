from sqlalchemy import Column, String, DateTime, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)  # e.g. "elo-1000", "streak-3-win"
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    criteria = Column(JSON, nullable=True)  # Optional JSON to store criteria parameters if needed
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=True)


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    achieved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
