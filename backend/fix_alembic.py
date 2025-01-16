from sqlalchemy import create_engine, text
from os import environ
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment
database_url = environ.get('DATABASE_URL')

try:
    # Create engine
    engine = create_engine(database_url)
    
    # Connect and execute update
    with engine.connect() as connection:
        connection.execute(text("UPDATE alembic_version SET version_num = '20250111_add_avatar_url_to_students'"))
        connection.commit()
    
    print("Successfully updated alembic_version table")
    
except Exception as e:
    print(f"Error: {e}")
