"""Add language_id to quiz_results

Revision ID: 3eb4a7e027c8
Revises: cb149c66525d
Create Date: 2024-11-03 20:03:25.761085

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3eb4a7e027c8'
down_revision = 'cb149c66525d'
branch_labels = None
depends_on = None


def upgrade():
    # Create quiz_result_details table
    op.create_table('quiz_result_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quiz_result_id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.Column('correct', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['quiz_result_id'], ['quiz_results.id']),
        sa.ForeignKeyConstraint(['word_id'], ['words.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Drop old quiz_results_detailed table
    op.drop_table('quiz_results_detailed')

    # Modify categories table
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)
        batch_op.drop_constraint('categories_name_key', type_='unique')

    # Modify quiz_results table
    with op.batch_alter_table('quiz_results', schema=None) as batch_op:
        batch_op.add_column(sa.Column('language_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('date', sa.DateTime(), nullable=True))
        batch_op.create_foreign_key('fk_quiz_results_user_id', 'users', ['user_id'], ['id'])
        batch_op.create_foreign_key('fk_quiz_results_language_id', 'languages', ['language_id'], ['id'])
        batch_op.drop_column('incorrect_answers')
        batch_op.drop_column('correct_answers')

    # Modify user_progress table
    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_user_progress_user_id', 'users', ['user_id'], ['id'])


def downgrade():
    # Revert user_progress table changes
    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_progress_user_id', type_='foreignkey')

    # Revert quiz_results table changes
    with op.batch_alter_table('quiz_results', schema=None) as batch_op:
        batch_op.add_column(sa.Column('correct_answers', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('incorrect_answers', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_constraint('fk_quiz_results_language_id', type_='foreignkey')
        batch_op.drop_constraint('fk_quiz_results_user_id', type_='foreignkey')
        batch_op.drop_column('date')
        batch_op.drop_column('language_id')

    # Revert categories table changes
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.create_unique_constraint('categories_name_key', ['name'])
        batch_op.alter_column('name',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)

    # Re-create old quiz_results_detailed table
    op.create_table('quiz_results_detailed',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('quiz_result_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('word_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('is_correct', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['quiz_result_id'], ['quiz_results.id'], name='quiz_results_detailed_quiz_result_id_fkey'),
        sa.ForeignKeyConstraint(['word_id'], ['words.id'], name='quiz_results_detailed_word_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='quiz_results_detailed_pkey')
    )

    # Drop new quiz_result_details table
    op.drop_table('quiz_result_details')
