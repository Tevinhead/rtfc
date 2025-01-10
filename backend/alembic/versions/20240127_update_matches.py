"""update matches for multiplayer

Revision ID: 20240127_update_matches
Revises: 20240110_add_arena_battles
Create Date: 2024-01-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '20240127_update_matches'
down_revision = '20240110_add_arena_battles'
branch_labels = None
depends_on = None

def upgrade():
    # Drop old tables and constraints
    op.drop_constraint('matches_player1_id_fkey', 'matches', type_='foreignkey')
    op.drop_constraint('matches_player2_id_fkey', 'matches', type_='foreignkey')
    op.drop_constraint('matches_winner_id_fkey', 'matches', type_='foreignkey')
    
    # Drop old columns from matches
    op.drop_column('matches', 'player1_id')
    op.drop_column('matches', 'player2_id')
    op.drop_column('matches', 'winner_id')
    op.drop_column('matches', 'player1_elo_before')
    op.drop_column('matches', 'player2_elo_before')
    op.drop_column('matches', 'player1_elo_after')
    op.drop_column('matches', 'player2_elo_after')
    op.drop_column('matches', 'round_number')
    
    # Add new columns to matches
    op.add_column('matches', sa.Column('num_rounds', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('matches', sa.Column('rounds_completed', sa.Integer(), nullable=False, server_default='0'))
    
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
    
    # Create rounds table
    op.create_table(
        'rounds',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('match_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('flashcard_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('round_number', sa.Integer(), nullable=False),
        sa.Column('winner_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['flashcard_id'], ['flashcards.id'])
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
    # Drop new tables
    op.drop_table('round_participants')
    op.drop_table('rounds')
    op.drop_table('match_participants')
    
    # Drop new columns from matches
    op.drop_column('matches', 'num_rounds')
    op.drop_column('matches', 'rounds_completed')
    
    # Add back old columns to matches
    op.add_column('matches', sa.Column('player1_id', postgresql.UUID(as_uuid=True), nullable=False))
    op.add_column('matches', sa.Column('player2_id', postgresql.UUID(as_uuid=True), nullable=False))
    op.add_column('matches', sa.Column('winner_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('matches', sa.Column('player1_elo_before', sa.Float(), nullable=True))
    op.add_column('matches', sa.Column('player2_elo_before', sa.Float(), nullable=True))
    op.add_column('matches', sa.Column('player1_elo_after', sa.Float(), nullable=True))
    op.add_column('matches', sa.Column('player2_elo_after', sa.Float(), nullable=True))
    
    # Add back foreign key constraints
    op.create_foreign_key('matches_player1_id_fkey', 'matches', 'students', ['player1_id'], ['id'])
    op.create_foreign_key('matches_player2_id_fkey', 'matches', 'students', ['player2_id'], ['id'])
    op.create_foreign_key('matches_winner_id_fkey', 'matches', 'students', ['winner_id'], ['id'])
