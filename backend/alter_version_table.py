import asyncio
from app.database import engine
from sqlalchemy import text

async def alter_table():
    async with engine.connect() as conn:
        await conn.execute(text("ALTER TABLE alembic_version ALTER COLUMN version_num TYPE varchar(128);"))
        await conn.commit()
        print("Successfully altered alembic_version table")

if __name__ == "__main__":
    asyncio.run(alter_table())
