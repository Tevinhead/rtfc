from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    elo_rating = Column(Float, default=1000.0)  # Starting ELO rating
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    total_matches = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    @property
    def win_rate(self):
        if self.total_matches == 0:
            return 0.0
        return (self.wins / self.total_matches) * 100

    def update_stats(self, won: bool, new_elo: float):
        """Update player statistics after a match"""
        self.elo_rating = new_elo
        self.total_matches += 1
        if won:
            self.wins += 1
        else:
            self.losses += 1
