# models/certificacion_predio.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from core.db import Base

class CertificacionPredio(Base):
    __tablename__ = "certificacion_predio"


    id = Column(Integer, primary_key=True, index=True)
    predio_id = Column(Integer, ForeignKey("predio.id"), nullable=False)
    certificacion_id = Column(Integer, ForeignKey("certificacion.id"), nullable=False)
    archivo_pdf = Column(String(255), nullable=True)
    fecha_expedicion = Column(Date, nullable=True)
    fecha_vencimiento = Column(Date, nullable=True)

    predio = relationship("Predio", back_populates="certificaciones")
    certificacion = relationship("Certificacion", lazy="joined")
