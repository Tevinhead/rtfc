"""fix unknown results

Revision ID: 20250116_fix_unknown
Revises: 20250113_add_images_to_flashcards
Create Date: 2025-01-16 12:16:26.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250116_fix_unknown'
down_revision = '20250116_merge_heads'
branch_labels = None
depends_on = None

def upgrade():
    # Delete round_participants for matches with no winners
    op.execute("""
    DELETE FROM round_participants
    WHERE round_id IN (
        SELECT r.id
        FROM rounds r
        JOIN matches m ON r.match_id = m.id
        WHERE m.status = 'completed' AND (
            m.winner_ids IS NULL
            OR array_length(m.winner_ids, 1) IS NULL
            OR array_length(m.winner_ids, 1) = 0
        )
    );
    """)

    # Delete rounds for matches with no winners
    op.execute("""
    DELETE FROM rounds
    WHERE match_id IN (
        SELECT id FROM matches
        WHERE status = 'completed' AND (
            winner_ids IS NULL
            OR array_length(winner_ids, 1) IS NULL
            OR array_length(winner_ids, 1) = 0
        )
    );
    """)

    # Delete match_participants for matches with no winners
    op.execute("""
    DELETE FROM match_participants
    WHERE match_id IN (
        SELECT id FROM matches
        WHERE status = 'completed' AND (
            winner_ids IS NULL
            OR array_length(winner_ids, 1) IS NULL
            OR array_length(winner_ids, 1) = 0
        )
    );
    """)

    # Delete matches with no winners
    op.execute("""
    DELETE FROM matches
    WHERE status = 'completed' AND (
        winner_ids IS NULL
        OR array_length(winner_ids, 1) IS NULL
        OR array_length(winner_ids, 1) = 0
    );
    """)

    # Recalculate student stats directly with a single query
    op.execute("""
    WITH match_stats AS (
        SELECT
            mp.student_id,
            COUNT(*) FILTER (WHERE m.status = 'completed' AND array_length(m.winner_ids, 1) > 0 AND mp.student_id = ANY(m.winner_ids)) as wins,
            COUNT(*) FILTER (WHERE m.status = 'completed' AND array_length(m.winner_ids, 1) > 0 AND mp.student_id != ALL(m.winner_ids)) as losses
        FROM match_participants mp
        JOIN matches m ON mp.match_id = m.id
        GROUP BY mp.student_id
    )
    UPDATE students s
    SET
        wins = COALESCE(ms.wins, 0),
        losses = COALESCE(ms.losses, 0),
        total_matches = COALESCE(ms.wins + ms.losses, 0)
    FROM match_stats ms
    WHERE s.id = ms.student_id;
    """)

def downgrade():
    # No downgrade path needed as this is a data fix
    pass