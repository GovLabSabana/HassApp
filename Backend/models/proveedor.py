from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.db import Base


class Proveedor(Base):
    __tablename__ = "proveedor"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    municipio_id = Column(Integer, ForeignKey("municipio.id"), nullable=False)

    municipio = relationship("Municipio", back_populates="proveedores")
    insumos = relationship("Insumo", back_populates="proveedor")
