from sqlalchemy import (
    Column, Integer, Date, ForeignKey, Numeric, String
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from core.db import Base


class Exportacion(Base):
    __tablename__ = "exportacion"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    metodo_salida = Column(String(70))  # aire, tierra, agua
    # puedes ajustar precisión según necesidad
    toneladas = Column(Numeric(10, 2))
    valor_fob = Column(Numeric(12, 2))
    puerto_salida = Column(String(70))
    puerto_llegada = Column(String(70))
    comprador_id = Column(Integer, ForeignKey("comprador.id"))

    comprador = relationship("Comprador", back_populates="exportaciones")
    cosechas = relationship("ExportacionCosecha", back_populates="exportacion")
