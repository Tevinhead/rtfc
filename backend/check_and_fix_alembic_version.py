import asyncio
from app.database import engine
from sqlalchemy import text

async def fix_version():
    async with engine.connect() as conn:
        # First ensure the column type is correct
        await conn.execute(text("ALTER TABLE alembic_version ALTER COLUMN version_num TYPE varchar(128);"))
        
        # Then update to our known good version
        await conn.execute(text("UPDATE alembic_version SET version_num = '20250111_add_avatar_url_to_students'"))
        
        await conn.commit()
        print("Successfully updated alembic_version table")

if __name__ == "__main__":
    asyncio.run(fix_version())
