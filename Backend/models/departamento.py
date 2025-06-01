from sqlalchemy import Column, Integer, String
from core.db import Base


class Departamento(Base):
    __tablename__ = "departamento"
    id = Column(Integer, primary_key=True, index=True)
    # Usar unique si quieres que no se repita
    name = Column(String(50), nullable=False, unique=True)
