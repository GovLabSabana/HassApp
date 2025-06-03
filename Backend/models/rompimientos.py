# models/rompimientos.py
from sqlalchemy import Table, Column, Integer, ForeignKey
from core.db import Base
cosecha_predio_table = Table(
    "cosecha_predio",
    Base.metadata,
    Column("cosecha_id", Integer, ForeignKey("cosecha.id"), primary_key=True),
    Column("predio_id", Integer, ForeignKey("predio.id"), primary_key=True),
)
