"""Add Municipio Departamento and Predio table change name of users to user

Revision ID: 18ab495df371
Revises: f885e07ab048
Create Date: 2025-06-01 17:00:39.092004

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '18ab495df371'
down_revision: Union[str, None] = 'f885e07ab048'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table('predio',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('nombre', sa.String(), nullable=False),
                    sa.Column('cedula_catastral',
                              sa.BigInteger(), nullable=False),
                    sa.Column('municipio_id', sa.Integer(), nullable=False),
                    sa.Column('usuario_id', sa.Integer(), nullable=False),
                    sa.Column('vereda', sa.String(), nullable=True),
                    sa.Column('direccion', sa.String(), nullable=True),
                    sa.Column('hectareas', sa.DECIMAL(
                        precision=10, scale=2), nullable=True),
                    sa.Column('vocacion', sa.String(), nullable=True),
                    sa.Column('altitud_promedio', sa.DECIMAL(
                        precision=10, scale=2), nullable=True),
                    sa.Column('tipo_riego', sa.String(), nullable=True),
                    sa.ForeignKeyConstraint(
                        ['municipio_id'], ['municipio.id'], ),
                    sa.ForeignKeyConstraint(['usuario_id'], ['user.id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('cedula_catastral')
                    )
    op.create_index(op.f('ix_predio_id'), 'predio', ['id'], unique=False)
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
