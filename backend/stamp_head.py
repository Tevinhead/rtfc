from alembic.config import Config
from alembic import command
import os

def stamp_head():
    # Get the directory containing this script
    dir_path = os.path.dirname(os.path.realpath(__file__))
    
    # Create Alembic configuration pointing to your alembic.ini
    alembic_cfg = Config(os.path.join(dir_path, "alembic.ini"))
    
    try:
        print("Stamping database with 'head' revision...")
        command.stamp(alembic_cfg, "head")
        print("Successfully stamped database with 'head' revision.")
        print("You can now run migrations without duplicate table errors.")
    except Exception as e:
        print(f"Error occurred while stamping database:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")

if __name__ == "__main__":
    stamp_head()
