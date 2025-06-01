from models.departamento import Departamento
from sqlalchemy import Column, Integer, String, ForeignKey
from core.db import Base


class Municipio(Base):
    __tablename__ = "municipio"
    id = Column(Integer, primary_key=True, index=True)
    # Usar unique si quieres que no se repita
    name = Column(String(50), nullable=False, unique=True)
    departamento_id = Column(Integer, ForeignKey(
        "departamento.id"))
