"""create achievements tables

Revision ID: 20250201_achievements
Revises: 20250116_merge_heads
Create Date: 2025-02-01 12:44:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '20250201_achievements'
down_revision = '20250116_merge_heads'  # Point to the latest merged head
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('code', sa.String(), nullable=False, unique=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('criteria', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
    )

    op.create_table(
        'student_achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('achievement_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('achievements.id', ondelete='CASCADE'), nullable=False),
        sa.Column('achieved_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )

    # Add some initial achievements
    op.execute("""
        INSERT INTO achievements (id, code, title, description)
        VALUES 
        (uuid_generate_v4(), 'elo-1000', 'ELO Master', 'Reach an ELO rating of 1000'),
        (uuid_generate_v4(), 'elo-1100', 'ELO Champion', 'Reach an ELO rating of 1100'),
        (uuid_generate_v4(), 'streak-3-win', 'Triple Threat', 'Win 3 matches in a row'),
        (uuid_generate_v4(), 'streak-4-win', 'Ultra Kill', 'Win 4 matches in a row')
    """)

def downgrade():
    op.drop_table('student_achievements')
    op.drop_table('achievements')
