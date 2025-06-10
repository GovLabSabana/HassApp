from sqlalchemy import Column, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from core.db import Base


class Pregunta(Base):
    __tablename__ = 'pregunta'

    id = Column(Integer, primary_key=True, autoincrement=True)
    texto = Column(Text, nullable=False)
    clave = Column(String(100), unique=True, nullable=False)
    tipo = Column(String(50), nullable=False)
    opciones = Column(JSON, nullable=True)

    respuestas = relationship("Respuesta", back_populates="pregunta")
