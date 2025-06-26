from sqlalchemy import Column, String
from core.db import Base


class Unidad(Base):
    __tablename__ = "unidad"

    nombre = Column(String(50), primary_key=True)
