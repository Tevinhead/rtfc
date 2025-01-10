from sqlalchemy import Column, DateTime, String, Integer, Enum, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from ..database import Base

class ArenaSessionStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ArenaParticipant(Base):
    __tablename__ = 'arena_participants'
    
    arena_id = Column(UUID(as_uuid=True), ForeignKey('arena_sessions.id'), primary_key=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id'), primary_key=True)
    fights_played = Column(Integer, default=0)
    
    # relationships
    arena = relationship("ArenaSession", back_populates="participants")
    student = relationship("Student", lazy="selectin")

class ArenaSession(Base):
    __tablename__ = "arena_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(
        Enum(ArenaSessionStatus, name="arena_session_status", create_type=False,
             values_callable=lambda x: [e.value for e in x]),
        default=ArenaSessionStatus.PENDING
    )
    num_rounds = Column(Integer, nullable=False)  # Total number of 1v1 fights to complete
    rounds_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # relationships
    participants = relationship("ArenaParticipant", back_populates="arena", cascade="all, delete-orphan", lazy="selectin")
    matches = relationship("Match", back_populates="arena_session", cascade="all, delete-orphan", lazy="selectin")
