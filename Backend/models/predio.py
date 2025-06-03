from sqlalchemy import Column, Integer, BigInteger, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from core.db import Base
from models.rompimientos import cosecha_predio_table
from models.municipio import Municipio
from models.usuario import Usuario


class Predio(Base):
    __tablename__ = "predio"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    cedula_catastral = Column(BigInteger, nullable=False, unique=True)
    municipio_id = Column(Integer, ForeignKey("municipio.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    vereda = Column(String(50), nullable=True)
    direccion = Column(String(100))
    hectareas = Column(DECIMAL(10, 2))
    vocacion = Column(String(50), nullable=True)
    altitud_promedio = Column(DECIMAL(10, 2))
    tipo_riego = Column(String(50), nullable=True)

    municipio = relationship("Municipio", back_populates="predios")
    usuario = relationship("Usuario", back_populates="predios")

    # Nueva relación muchos a muchos
    cosechas = relationship(
        "Cosecha", secondary=cosecha_predio_table, back_populates="predios", lazy="selectin")
