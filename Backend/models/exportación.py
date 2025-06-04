# from sqlalchemy import (
#     Column, Integer, String, Text, Date, ForeignKey, Numeric
# )
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import relationship

# Base = declarative_base()


# class Exportacion(Base):
#     __tablename__ = "exportacion"

#     id = Column(Integer, primary_key=True, index=True)
#     fecha = Column(Date, nullable=False)
#     metodo_salida = Column(Text)  # aire, tierra, agua
#     # puedes ajustar precisión según necesidad
#     toneladas = Column(Numeric(10, 2))
#     valor_fob = Column(Numeric(12, 2))
#     puerto_salida = Column(Text)
#     puerto_llegada = Column(Text)
#     comprador_id = Column(Integer, ForeignKey("comprador.id"))

#     comprador = relationship("Comprador", back_populates="exportaciones")
#     cosechas = relationship("ExportacionCosecha", back_populates="exportacion")
