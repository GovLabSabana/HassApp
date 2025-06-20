from sqlalchemy import Column, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from core.db import Base
from models.insumo import Insumo
from decimal import Decimal


class InsumoCosecha(Base):
    __tablename__ = "insumo_cosecha"

    id = Column(Integer, primary_key=True, index=True)
    insumo_id = Column(
        Integer,
        ForeignKey("insumo.id", ondelete="CASCADE"),
        nullable=False
    )

    cosecha_id = Column(Integer, ForeignKey("cosecha.id"), nullable=False)
    cantidad = Column(DECIMAL(10, 2), nullable=False)

    insumo = relationship("Insumo", back_populates="insumos_cosecha")
    cosecha = relationship("Cosecha", back_populates="insumos_cosecha")

    @property
    def nombre_comercial(self) -> str:
        return self.insumo.nombre_comercial

    @property
    def costo_unitario(self) -> Decimal:
        return self.insumo.costo_unitario
