import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
import os
import uuid
from datetime import datetime

# Import the Achievement model
from app.models.achievement import Achievement

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError("DATABASE_URL environment variable not set")

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def add_elo_achievements():
    async with async_session() as session:
        # Check if ELO achievements already exist
        result = await session.execute(
            select(Achievement).where(Achievement.code.in_(["ELO_1000", "ELO_1100"]))
        )
        existing = result.scalars().all()
        
        if existing:
            print(f"ELO achievements already exist: {[a.code for a in existing]}")
            return
        
        # Add ELO achievements
        elo_1000 = Achievement(
            id=uuid.uuid4(),
            code="ELO_1000",
            title="ELO Master",
            description="Reach an ELO rating of 1000",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        elo_1100 = Achievement(
            id=uuid.uuid4(),
            code="ELO_1100",
            title="ELO Champion",
            description="Reach an ELO rating of 1100",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(elo_1000)
        session.add(elo_1100)
        
        await session.commit()
        print("Added ELO achievements: ELO_1000, ELO_1100")

if __name__ == "__main__":
    asyncio.run(add_elo_achievements())
