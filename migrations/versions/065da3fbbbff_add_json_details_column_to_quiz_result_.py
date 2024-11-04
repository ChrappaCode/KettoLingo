"""Add JSON details column to quiz_result_details

Revision ID: 065da3fbbbff
Revises: 3eb4a7e027c8
Create Date: 2024-11-04 09:38:18.887196

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import JSON

# revision identifiers, used by Alembic.
revision = '065da3fbbbff'
down_revision = '3eb4a7e027c8'
branch_labels = None
depends_on = None


def upgrade():
    # Add the JSON 'details' column and remove 'word_id' and 'correct' columns
    with op.batch_alter_table('quiz_result_details') as batch_op:
        batch_op.drop_column('word_id')
        batch_op.drop_column('correct')
        batch_op.add_column(sa.Column('details', JSON, nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # Revert changes by adding 'word_id' and 'correct' columns back and dropping 'details'
    with op.batch_alter_table('quiz_result_details') as batch_op:
        batch_op.drop_column('details')
        batch_op.add_column(sa.Column('word_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('correct', sa.Boolean(), nullable=False))

    # ### end Alembic commands ###
