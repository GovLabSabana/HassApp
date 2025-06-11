from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.db import Base
from models.pregunta import Pregunta
from models.usuario import Usuario


class Respuesta(Base):
    __tablename__ = 'respuesta'

    id = Column(Integer, primary_key=True, autoincrement=True)
    pregunta_id = Column(Integer, ForeignKey('pregunta.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuario.id'),
                        nullable=False)
    respuesta = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    pregunta = relationship("Pregunta", back_populates="respuestas")
    usuario = relationship("Usuario")
