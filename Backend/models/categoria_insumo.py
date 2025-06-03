from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from core.db import Base


class CategoriaInsumo(Base):
    __tablename__ = "categoria_insumo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)

    insumos = relationship("Insumo", back_populates="categoria")
