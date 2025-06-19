from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.db import Base


class Proveedor(Base):
    __tablename__ = "proveedor"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    tipo_doc = Column(Integer, ForeignKey("tipo_documento.id"))
    num_doc = Column(String(70), nullable=False)
    ciudad = Column(String(70))
    pais = Column(String(50))
    direccion = Column(String(255))
    contacto = Column(String(70))

    insumos = relationship("Insumo", back_populates="proveedor")
