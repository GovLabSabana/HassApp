from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from core.db import Base
from models.categoria_insumo import CategoriaInsumo
from models.proveedor import Proveedor


class Insumo(Base):
    __tablename__ = "insumo"

    id = Column(Integer, primary_key=True, index=True)
    nombre_comercial = Column(String(155), nullable=False)
    unidad = Column(String(50), nullable=False)
    categoria_id = Column(Integer, ForeignKey(
        "categoria_insumo.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"), nullable=False)
    costo_unitario = Column(DECIMAL(10, 2), nullable=False)

    categoria = relationship("CategoriaInsumo", back_populates="insumos")
    proveedor = relationship("Proveedor", back_populates="insumos")
    insumos_cosecha = relationship(
        "InsumoCosecha",
        back_populates="insumo",
        passive_deletes=True
    )
