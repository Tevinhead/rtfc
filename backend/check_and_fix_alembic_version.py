import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL and ensure it uses the async driver
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create an async engine
engine = create_async_engine(DATABASE_URL, echo=True)

async def check_table_structure():
    async with engine.connect() as conn:
        # Query to get column information for matches table
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'matches'
            ORDER BY ordinal_position;
        """))
        columns = result.fetchall()
        print("\nMatches table structure:")
        for col in columns:
            print(f"Column: {col[0]}, Type: {col[1]}, Nullable: {col[2]}")

async def check_and_fix_alembic_version():
    async with engine.connect() as conn:
        # 1) Check what's in alembic_version
        result = await conn.execute(text("SELECT version_num FROM alembic_version"))
        row = result.fetchone()

        if row:
            current_version = row[0]
            print(f"Current alembic_version: {current_version}")
        else:
            print("No version found in alembic_version table.")
            return

        # 2) Force update to the latest revision
        if current_version != "20240130_make_arena_id_nullable":
            # Set it to the latest revision
            new_revision = "20240130_make_arena_id_nullable"
            # First delete any existing rows
            await conn.execute(text("DELETE FROM alembic_version"))
            # Then insert the new version
            await conn.execute(
                text("INSERT INTO alembic_version (version_num) VALUES (:rev)"),
                {"rev": new_revision}
            )
            await conn.commit()
            print(f"Updated alembic_version to {new_revision}.")
        else:
            print("Alembic version is already at latest revision.")

async def main():
    await check_and_fix_alembic_version()
    await check_table_structure()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
