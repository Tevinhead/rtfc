"""add match participants

Revision ID: 20240101_add_match_participants
Revises: 0312ea2413c8
Create Date: 2024-01-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '20240101_add_match_participants'
down_revision = '0312ea2413c8'
branch_labels = None
depends_on = None

def upgrade():
    # Create match_participants table
    op.create_table(
        'match_participants',
        sa.Column('match_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('elo_before', sa.Float(), nullable=True),
        sa.Column('elo_after', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('match_id', 'student_id')
    )

    # Create round_participants table
    op.create_table(
        'round_participants',
        sa.Column('round_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('elo_before', sa.Float(), nullable=True),
        sa.Column('elo_change', sa.Float(), nullable=True),
        sa.Column('answer', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['round_id'], ['rounds.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('round_id', 'student_id')
    )

def downgrade():
    op.drop_table('round_participants')
    op.drop_table('match_participants')
