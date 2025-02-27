import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError("DATABASE_URL environment variable not set")

engine = create_async_engine(DATABASE_URL)

async def check_achievements_table():
    async with engine.connect() as conn: # use engine.connect() instead of engine.begin() for async engine
        result = await conn.execute(text("SELECT * FROM achievements;"))
        rows = result.fetchall()
        if rows:
            print("Achievements table is seeded:")
            for row in rows:
                print(row)
        else:
            print("Achievements table is empty.")

if __name__ == "__main__":
    asyncio.run(check_achievements_table())