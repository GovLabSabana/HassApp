from sqlalchemy import Column, Integer, Date, ForeignKey, DECIMAL, Text, Table
from sqlalchemy.orm import relationship
from models.rompimientos import cosecha_predio_table
from core.db import Base
from models.producto import Producto
from models.calidad import Calidad
from models.insumo_cosecha import InsumoCosecha
# from models.exportacion_cosecha import ExportacionCosecha


class Cosecha(Base):
    __tablename__ = "cosecha"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    producto_id = Column(Integer, ForeignKey("producto.id"), nullable=False)
    calidad_id = Column(Integer, ForeignKey("calidad.id"), nullable=False)
    toneladas = Column(DECIMAL(10, 2), nullable=True)
    hectareas = Column(DECIMAL(10, 2), nullable=True)
    calibre_promedio = Column(DECIMAL(10, 2), nullable=True)
    observaciones = Column(Text, nullable=True)

    producto = relationship("Producto", back_populates="cosechas")
    calidad = relationship("Calidad")

    # Nueva relación muchos a muchos
    predios = relationship(
        "Predio", secondary=cosecha_predio_table, back_populates="cosechas", lazy="selectin")
    insumos_cosecha = relationship("InsumoCosecha", back_populates="cosecha")
    exportaciones = relationship(
        "ExportacionCosecha", back_populates="cosecha")
