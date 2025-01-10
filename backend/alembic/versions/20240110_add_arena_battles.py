"""add arena battles

Revision ID: 20240110_add_arena_battles
Revises: abcde_add_elo_before_to_matches
Create Date: 2024-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '20240110_add_arena_battles'
down_revision = 'abcde_add_elo_before_to_matches'
branch_labels = None
depends_on = None

def upgrade():
    # Create enums if they don't exist
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arena_session_status') THEN CREATE TYPE arena_session_status AS ENUM ('pending', 'in_progress', 'completed'); END IF; END $$")
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN CREATE TYPE match_status AS ENUM ('pending', 'in_progress', 'completed'); END IF; END $$")
    
    # Create arena_sessions table
    op.create_table(
        'arena_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('status', postgresql.ENUM('pending', 'in_progress', 'completed', name='arena_session_status', create_type=False), nullable=False),
        sa.Column('num_rounds', sa.Integer(), nullable=False),
        sa.Column('rounds_completed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    
    # Create arena_participants table
    op.create_table(
        'arena_participants',
        sa.Column('arena_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fights_played', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['arena_id'], ['arena_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('arena_id', 'student_id')
    )
    
    # Drop old tables if they exist
    op.execute("DROP TABLE IF EXISTS round_participants CASCADE")
    op.execute("DROP TABLE IF EXISTS rounds CASCADE")
    op.execute("DROP TABLE IF EXISTS match_participants CASCADE")
    op.execute("DROP TABLE IF EXISTS matches CASCADE")
    
    # Create new matches table for 1v1 battles
    op.create_table(
        'matches',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('arena_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('round_number', sa.Integer(), nullable=False),
        sa.Column('status', postgresql.ENUM('pending', 'in_progress', 'completed', name='match_status', create_type=False), nullable=False),
        sa.Column('player1_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('player2_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('winner_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('player1_elo_before', sa.Float(), nullable=False),
        sa.Column('player2_elo_before', sa.Float(), nullable=False),
        sa.Column('player1_elo_after', sa.Float(), nullable=True),
        sa.Column('player2_elo_after', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['arena_id'], ['arena_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['player1_id'], ['students.id']),
        sa.ForeignKeyConstraint(['player2_id'], ['students.id']),
        sa.ForeignKeyConstraint(['winner_id'], ['students.id'])
    )

def downgrade():
    # Drop new tables
    op.drop_table('matches')
    op.drop_table('arena_participants')
    op.drop_table('arena_sessions')
    
    # Drop enums if they exist
    op.execute("DROP TYPE IF EXISTS arena_session_status")
    op.execute("DROP TYPE IF EXISTS match_status")
    
    # Recreate old tables (not implemented for brevity)
    pass
