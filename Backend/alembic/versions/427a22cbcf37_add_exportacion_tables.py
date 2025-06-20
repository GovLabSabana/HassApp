"""Add exportacion tables

Revision ID: 427a22cbcf37
Revises: 99d8e360eafd
Create Date: 2025-06-03 21:35:53.065461

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '427a22cbcf37'
down_revision: Union[str, None] = '99d8e360eafd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('comprador',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=70), nullable=False),
    sa.Column('tipo_doc', sa.Integer(), nullable=True),
    sa.Column('num_doc', sa.String(length=70), nullable=False),
    sa.Column('ciudad', sa.String(length=70), nullable=True),
    sa.Column('pais', sa.String(length=50), nullable=True),
    sa.Column('direccion', sa.String(length=70), nullable=True),
    sa.Column('contacto', sa.String(length=70), nullable=True),
    sa.ForeignKeyConstraint(['tipo_doc'], ['tipo_documento.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comprador_id'), 'comprador', ['id'], unique=False)
    op.create_table('exportacion',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('fecha', sa.Date(), nullable=False),
    sa.Column('metodo_salida', sa.String(length=70), nullable=True),
    sa.Column('toneladas', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('valor_fob', sa.Numeric(precision=12, scale=2), nullable=True),
    sa.Column('puerto_salida', sa.String(length=70), nullable=True),
    sa.Column('puerto_llegada', sa.String(length=70), nullable=True),
    sa.Column('comprador_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['comprador_id'], ['comprador.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exportacion_id'), 'exportacion', ['id'], unique=False)
    op.create_table('exportacion_cosecha',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('exportacion_id', sa.Integer(), nullable=True),
    sa.Column('cosecha_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['cosecha_id'], ['cosecha.id'], ),
    sa.ForeignKeyConstraint(['exportacion_id'], ['exportacion.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exportacion_cosecha_id'), 'exportacion_cosecha', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_exportacion_cosecha_id'), table_name='exportacion_cosecha')
    op.drop_table('exportacion_cosecha')
    op.drop_index(op.f('ix_exportacion_id'), table_name='exportacion')
    op.drop_table('exportacion')
    op.drop_index(op.f('ix_comprador_id'), table_name='comprador')
    op.drop_table('comprador')
    # ### end Alembic commands ###
