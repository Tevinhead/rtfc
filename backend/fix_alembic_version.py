import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def fix_alembic_version():
    # Create async engine with correct database name and password
    engine = create_async_engine('postgresql+asyncpg://postgres:Raintree112233@localhost:5432/battlearena')

    async with engine.begin() as conn:
        # First check current version
        result = await conn.execute(text('SELECT version_num FROM alembic_version'))
        current_versions = result.fetchall()
        print(f"Current versions: {current_versions}")
        
        # Clear existing version numbers
        await conn.execute(text('DELETE FROM alembic_version'))
        
        # First ensure the merge is recorded - this combines the avatar_url and elo_before changes
        await conn.execute(
            text("INSERT INTO alembic_version (version_num) VALUES ('20250116_merge_heads')")
        )
        
        # Then update to the achievements migration which builds on top of the merge
        await conn.execute(
            text("UPDATE alembic_version SET version_num = '20250201_achievements'")
        )
    
    await engine.dispose()
    print("Alembic version table fixed.")

    # Verify the final state
    engine = create_async_engine('postgresql+asyncpg://postgres:Raintree112233@localhost:5432/battlearena')
    async with engine.begin() as conn:
        result = await conn.execute(text('SELECT version_num FROM alembic_version'))
        final_versions = result.fetchall()
        print(f"Final version state: {final_versions}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_alembic_version())
