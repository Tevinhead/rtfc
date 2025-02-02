"""merge_multiple_heads

Revision ID: b879f555a6b0
Revises: 20250116_fix_unknown, 20250201_achievements, 623fcaf9bd91
Create Date: 2025-02-02 08:01:32.419133+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b879f555a6b0'
down_revision: Union[str, None] = ('20250116_fix_unknown', '20250201_achievements', '623fcaf9bd91')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
