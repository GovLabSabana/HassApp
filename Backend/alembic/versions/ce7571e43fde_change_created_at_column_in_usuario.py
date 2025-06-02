"""Change created_at column in Usuario

Revision ID: ce7571e43fde
Revises: e4a1b9fb1d41
Create Date: 2025-06-02 11:12:20.592658

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce7571e43fde'
down_revision: Union[str, None] = 'e4a1b9fb1d41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'usuario',
        'created_at',
        server_default=sa.text('CURRENT_TIMESTAMP'),
        existing_type=sa.TIMESTAMP()
    )


def downgrade() -> None:
    op.alter_column(
        'usuario',
        'created_at',
        server_default=None,
        existing_type=sa.TIMESTAMP()
    )
