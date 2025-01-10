from sqlalchemy import Column, ForeignKey, DateTime, String, Float, Enum, Integer, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
import enum
from ..database import Base

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class MatchParticipant(Base):
    __tablename__ = "match_participants"

    match_id = Column(UUID(as_uuid=True), ForeignKey('matches.id'), primary_key=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id'), primary_key=True)
    elo_before = Column(Float)
    elo_after = Column(Float)

    # relationships
    match = relationship("Match", back_populates="participants")
    student = relationship("Student")

class RoundParticipant(Base):
    __tablename__ = "round_participants"

    round_id = Column(UUID(as_uuid=True), ForeignKey('rounds.id'), primary_key=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id'), primary_key=True)
    elo_before = Column(Float)
    elo_change = Column(Float)
    answer = Column(String)

    # relationships
    round = relationship("Round", back_populates="participants")
    student = relationship("Student")

class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    arena_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arena_sessions.id", ondelete="CASCADE"),
        nullable=True
    )
    status = Column(
        Enum(MatchStatus, name="match_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=MatchStatus.PENDING
    )  # Must match DB type name exactly
    num_rounds = Column(Integer, nullable=False)
    rounds_completed = Column(Integer, default=0)
    
    # Array of winner IDs (supports multiple winners)
    winner_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # relationships
    participants = relationship("MatchParticipant", back_populates="match", cascade="all, delete-orphan", lazy="selectin")
    rounds = relationship("Round", back_populates="match", cascade="all, delete-orphan")
    arena_session = relationship("ArenaSession", back_populates="matches")

class Round(Base):
    __tablename__ = "rounds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    flashcard_id = Column(UUID(as_uuid=True), ForeignKey("flashcards.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Array of winner IDs (supports multiple winners)
    winner_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=True)

    # relationships
    match = relationship("Match", back_populates="rounds")
    flashcard = relationship("Flashcard")
    participants = relationship("RoundParticipant", back_populates="round", cascade="all, delete-orphan")
