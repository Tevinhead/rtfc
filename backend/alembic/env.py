from logging.config import fileConfig
import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Load environment variables
load_dotenv()

import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

# Import all models and Base
from app.database import Base
import app.models.student
import app.models.flashcard
import app.models.match
import app.models.achievement
import app.models.arena_session

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata
target_metadata = Base.metadata

# Get database URL from environment
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL environment variable must be set")

# Replace postgresql:// with postgresql+asyncpg:// for async SQLAlchemy
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Override sqlalchemy.url in alembic.ini
config.set_main_option("sqlalchemy.url", db_url)

def do_run_migrations(connection: Connection) -> None:
    """Run migrations in sync mode"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,  # Compare column types
        compare_server_default=True,  # Compare server defaults
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in async mode"""
    try:
        configuration = config.get_section(config.config_ini_section, {})
        configuration["sqlalchemy.url"] = db_url

        # Configure async engine with proper pooling and timeout settings
        connectable = async_engine_from_config(
            configuration,
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            connect_args={
                "command_timeout": 60,  # 60 second timeout
                "server_settings": {
                    "application_name": "alembic",  # Identify migrations in pg_stat_activity
                }
            }
        )

        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

        await connectable.dispose()
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations() -> None:
    """Run migrations based on context mode"""
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        try:
            asyncio.run(run_async_migrations())
        except Exception as e:
            print(f"Migration failed: {str(e)}")
            raise

# Execute migrations
run_migrations()
