from sqlalchemy import (
    Column, Integer, ForeignKey, String
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from core.db import Base


class Comprador(Base):
    __tablename__ = "comprador"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(70), nullable=False)
    tipo_doc = Column(Integer, ForeignKey("tipo_documento.id"))
    num_doc = Column(String(70), nullable=False)
    ciudad = Column(String(70))
    pais = Column(String(50))
    direccion = Column(String(70))
    contacto = Column(String(70))

    tipo_documento = relationship(
        "TipoDocumento")
    exportaciones = relationship("Exportacion", back_populates="comprador")
