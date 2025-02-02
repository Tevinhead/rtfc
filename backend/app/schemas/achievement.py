from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AchievementBase(BaseModel):
    code: str
    title: str
    description: str | None = None
    criteria: dict | None = None

class AchievementResponse(AchievementBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class StudentAchievementResponse(BaseModel):
    id: UUID
    student_id: UUID
    achievement: AchievementResponse
    achieved_at: datetime

    class Config:
        orm_mode = True
