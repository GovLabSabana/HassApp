from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.db import Base
from models.exportacion import Exportacion


class ExportacionCosecha(Base):
    __tablename__ = "exportacion_cosecha"

    id = Column(Integer, primary_key=True, index=True)
    exportacion_id = Column(Integer, ForeignKey(
        "exportacion.id", ondelete="CASCADE"))
    cosecha_id = Column(Integer, ForeignKey("cosecha.id", ondelete="CASCADE"))

    exportacion = relationship("Exportacion", back_populates="cosechas")
    cosecha = relationship("Cosecha", back_populates="exportaciones")
