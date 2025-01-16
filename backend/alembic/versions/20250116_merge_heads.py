"""merge heads

Revision ID: 20250116_merge_heads
Revises: 20250111_add_avatar_url_to_students, abcde_add_elo_before_to_matches
Create Date: 2025-01-16 12:17:23.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250116_merge_heads'
down_revision = None
branch_labels = None
depends_on = None

# Specify all parents
parents = ['20250111_add_avatar_url_to_students', 'abcde_add_elo_before_to_matches']

def upgrade():
    pass

def downgrade():
    pass