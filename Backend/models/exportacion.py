from sqlalchemy import (
    Column, Integer, Date, ForeignKey, Numeric, String
)
from sqlalchemy.orm import relationship
from core.db import Base
from models.comprador import Comprador
from models.usuario import Usuario


class Exportacion(Base):
    __tablename__ = "exportacion"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    metodo_salida = Column(String(70))  # aire, tierra, agua
    toneladas = Column(Numeric(10, 2))
    valor_fob = Column(Numeric(12, 2))
    puerto_salida = Column(String(255))
    puerto_llegada = Column(String(255))
    comprador_id = Column(Integer, ForeignKey("comprador.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))

    comprador = relationship("Comprador", back_populates="exportaciones")
    usuario = relationship("Usuario", back_populates="exportaciones")
    cosechas = relationship(
        "ExportacionCosecha",
        back_populates="exportacion",
        cascade="all, delete-orphan"
    )
