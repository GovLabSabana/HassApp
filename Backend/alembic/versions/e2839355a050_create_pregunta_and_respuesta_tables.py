"""Create Pregunta and Respuesta tables

Revision ID: e2839355a050
Revises: 656326356da2
Create Date: 2025-06-09 18:52:23.594006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'e2839355a050'
down_revision: Union[str, None] = '656326356da2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
