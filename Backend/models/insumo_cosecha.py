from sqlalchemy import Column, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from core.db import Base
from models.insumo import Insumo


class InsumoCosecha(Base):
    __tablename__ = "insumo_cosecha"

    id = Column(Integer, primary_key=True, index=True)
    insumo_id = Column(Integer, ForeignKey("insumo.id"), nullable=False)
    cosecha_id = Column(Integer, ForeignKey("cosecha.id"), nullable=False)
    cantidad = Column(DECIMAL(10, 2), nullable=False)
    costo_unitario = Column(DECIMAL(10, 2), nullable=False)

    insumo = relationship("Insumo", back_populates="insumos_cosecha")
    cosecha = relationship("Cosecha", back_populates="insumos_cosecha")
