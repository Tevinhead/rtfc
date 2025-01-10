"""add elo before to matches

Revision ID: abcde_add_elo_before_to_matches
Revises: 20240101_add_match_participants
Create Date: 2024-01-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = 'abcde_add_elo_before_to_matches'
down_revision = '20240101_add_match_participants'
branch_labels = None
depends_on = None

def upgrade():
    # Add ELO tracking columns to matches
    op.add_column('matches', sa.Column('player1_elo_before', sa.Float(), nullable=True))
    op.add_column('matches', sa.Column('player2_elo_before', sa.Float(), nullable=True))

def downgrade():
    # Remove ELO tracking columns
    op.drop_column('matches', 'player1_elo_before')
    op.drop_column('matches', 'player2_elo_before')
