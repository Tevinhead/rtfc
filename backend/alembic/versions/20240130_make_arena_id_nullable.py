"""make arena id nullable

Revision ID: 20240130_make_arena_id_nullable
Revises: 20240127_update_matches
Create Date: 2024-01-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '20240130_make_arena_id_nullable'
down_revision = '20240127_update_matches'
branch_labels = None
depends_on = None

def upgrade():
    # Make arena_id nullable
    op.alter_column('matches', 'arena_id',
               existing_type=postgresql.UUID(),
               nullable=True)

def downgrade():
    # Make arena_id non-nullable again
    op.alter_column('matches', 'arena_id',
               existing_type=postgresql.UUID(),
               nullable=False)
