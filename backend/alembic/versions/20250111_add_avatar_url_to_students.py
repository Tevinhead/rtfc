"""
Add avatar_url to students

Revision ID: 20250111_add_avatar_url_to_students
Revises: 20250110_add_match_winner_ids
Create Date: 2025-01-11
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250111_add_avatar_url_to_students'
down_revision = '20250110_add_match_winner_ids'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('students', sa.Column('avatar_url', sa.String(), nullable=True))

def downgrade():
    op.drop_column('students', 'avatar_url')
