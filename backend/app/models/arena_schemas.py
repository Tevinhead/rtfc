from pydantic import BaseModel, conlist
from typing import List, Optional
from uuid import UUID
from .arena_session import ArenaSessionStatus
from .match import MatchStatus

class CreateArenaRequest(BaseModel):
    student_ids: conlist(UUID, min_length=2)  # At least 2 players required
    num_rounds: int

class StudentStatsResponse(BaseModel):
    student_id: UUID
    name: str
    elo_rating: float
    wins: int
    losses: int
    fights_played: int
    elo_change: float  # Total ELO change in this arena session

    class Config:
        from_attributes = True

class ArenaSessionResponse(BaseModel):
    id: UUID
    status: ArenaSessionStatus
    num_rounds: int
    rounds_completed: int
    participants: List[StudentStatsResponse]

    class Config:
        from_attributes = True

class MatchParticipantResponse(BaseModel):
    student_id: UUID
    elo_before: float
    elo_after: Optional[float]

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: UUID
    status: MatchStatus
    num_rounds: int
    rounds_completed: int
    participants: List[MatchParticipantResponse]

    class Config:
        from_attributes = True

class SetMatchWinnerRequest(BaseModel):
    winner_ids: List[UUID]

class MatchWinnerResponse(BaseModel):
    match: MatchResponse
    arena_session: ArenaSessionResponse

    class Config:
        from_attributes = True
