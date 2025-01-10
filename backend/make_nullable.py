from app.database import engine
import asyncio
from sqlalchemy import text

async def make_arena_id_nullable():
    async with engine.connect() as conn:
        await conn.execute(text('ALTER TABLE matches ALTER COLUMN arena_id DROP NOT NULL'))
        await conn.commit()
        print("Successfully made arena_id nullable")

if __name__ == '__main__':
    asyncio.run(make_arena_id_nullable())
