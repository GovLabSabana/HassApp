"""Create Pregunta and Respuesta tables

Revision ID: e36ff18966f2
Revises: e2839355a050
Create Date: 2025-06-09 18:54:45.471517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'e36ff18966f2'
down_revision: Union[str, None] = 'e2839355a050'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
