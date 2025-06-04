# from sqlalchemy import (
#     Column, Integer, ForeignKey
# )
# from sqlalchemy.orm import relationship
# from core.db import Base


# class ExportacionCosecha(Base):
#     __tablename__ = "exportacion_cosecha"

#     id = Column(Integer, primary_key=True, index=True)
#     exportacion_id = Column(Integer, ForeignKey("exportacion.id"))
#     cosecha_id = Column(Integer, ForeignKey("cosecha.id"))

#     exportacion = relationship("Exportacion", back_populates="cosechas")
#     cosecha = relationship("Cosecha", back_populates="exportaciones")
