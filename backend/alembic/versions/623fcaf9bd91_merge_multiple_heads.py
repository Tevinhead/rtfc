"""merge multiple heads

Revision ID: 623fcaf9bd91
Revises: 20240130_make_arena_id_nullable, 20250111_add_avatar_url_to_students
Create Date: 2025-01-10 17:39:17.697032

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '623fcaf9bd91'
down_revision: Union[str, None] = ('20240130_make_arena_id_nullable', '20250111_add_avatar_url_to_students')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
