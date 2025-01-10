from sqlalchemy import create_engine, text
from os import environ
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment
database_url = environ.get('DATABASE_URL')

try:
    # Create engine
    engine = create_engine(database_url.replace('+asyncpg', ''))  # Use sync driver for this script
    
    # Connect and check current version
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version_num FROM alembic_version")).fetchone()
        print(f"Current version in database: {result[0] if result else 'No version found'}")
        
        # Update to a known good revision (20240110_add_arena_battles)
        if result and result[0] == '3f1bd2862147':
            connection.execute(text("UPDATE alembic_version SET version_num = '20240110_add_arena_battles'"))
            connection.commit()
            print("Updated version to 20240110_add_arena_battles")
    
except Exception as e:
    print(f"Error: {e}")
