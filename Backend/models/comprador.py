# from sqlalchemy import (
#     Column, Integer, String, Text, Date, ForeignKey, Numeric
# )
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import relationship

# Base = declarative_base()


# class Comprador(Base):
#     __tablename__ = "comprador"

#     id = Column(Integer, primary_key=True, index=True)
#     nombre = Column(Text, nullable=False)
#     tipo_doc = Column(Integer, ForeignKey("tipo_documento.id"))
#     num_doc = Column(Text, nullable=False)
#     ciudad = Column(Text)
#     pais = Column(Text)
#     direccion = Column(Text)
#     contacto = Column(Text)

#     tipo_documento = relationship(
#         "TipoDocumento", back_populates="compradores")
#     exportaciones = relationship("Exportacion", back_populates="comprador")
