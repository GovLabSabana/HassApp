"""Add tipo_documento table and update users

Revision ID: ffba24432e7f
Revises: db9ab8fada96
Create Date: 2025-06-01 16:22:24.258439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ffba24432e7f'
down_revision: Union[str, None] = 'db9ab8fada96'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
