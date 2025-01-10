"""remove_email_from_students

Revision ID: 0312ea2413c8
Revises: 43d5d5646264
Create Date: 2024-12-23 23:21:32.334539

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0312ea2413c8'
down_revision: Union[str, None] = '43d5d5646264'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('students', 'email')


def downgrade() -> None:
    op.add_column('students',
        sa.Column('email', sa.String(), nullable=False, unique=True)
    )
