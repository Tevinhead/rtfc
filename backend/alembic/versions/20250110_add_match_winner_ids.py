"""add winner_ids array to matches

Revision ID: 20250110_add_match_winner_ids
Revises: abcde_add_elo_before_to_matches
Create Date: 2025-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '20250110_add_match_winner_ids'
down_revision = 'abcde_add_elo_before_to_matches'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'matches',
        sa.Column('winner_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=True)
    )

def downgrade():
    op.drop_column('matches', 'winner_ids')
