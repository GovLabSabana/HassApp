"""Add Insumos, CategoriaIsnumo, Proveedor and insumo_cosecha tables

Revision ID: 2b04b6218b59
Revises: 075dc0241bed
Create Date: 2025-06-02 20:42:16.364093

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b04b6218b59'
down_revision: Union[str, None] = '075dc0241bed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('categoria_insumo',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=50), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categoria_insumo_id'), 'categoria_insumo', ['id'], unique=False)
    op.create_table('proveedor',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=50), nullable=False),
    sa.Column('tipo_doc', sa.Integer(), nullable=False),
    sa.Column('num_doc', sa.String(length=50), nullable=False),
    sa.Column('municipio_id', sa.Integer(), nullable=False),
    sa.Column('rut', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['municipio_id'], ['municipio.id'], ),
    sa.ForeignKeyConstraint(['tipo_doc'], ['tipo_documento.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proveedor_id'), 'proveedor', ['id'], unique=False)
    op.create_table('insumo',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre_comercial', sa.String(length=50), nullable=False),
    sa.Column('unidad', sa.String(length=50), nullable=False),
    sa.Column('categoria_id', sa.Integer(), nullable=False),
    sa.Column('proveedor_id', sa.Integer(), nullable=False),
    sa.Column('costo_unitario', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('stock', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['categoria_id'], ['categoria_insumo.id'], ),
    sa.ForeignKeyConstraint(['proveedor_id'], ['proveedor.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_insumo_id'), 'insumo', ['id'], unique=False)
    op.create_table('insumo_cosecha',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('insumo_id', sa.Integer(), nullable=False),
    sa.Column('cosecha_id', sa.Integer(), nullable=False),
    sa.Column('cantidad', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('costo_unitario', sa.DECIMAL(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['cosecha_id'], ['cosecha.id'], ),
    sa.ForeignKeyConstraint(['insumo_id'], ['insumo.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_insumo_cosecha_id'), 'insumo_cosecha', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_insumo_cosecha_id'), table_name='insumo_cosecha')
    op.drop_table('insumo_cosecha')
    op.drop_index(op.f('ix_insumo_id'), table_name='insumo')
    op.drop_table('insumo')
    op.drop_index(op.f('ix_proveedor_id'), table_name='proveedor')
    op.drop_table('proveedor')
    op.drop_index(op.f('ix_categoria_insumo_id'), table_name='categoria_insumo')
    op.drop_table('categoria_insumo')
    # ### end Alembic commands ###
