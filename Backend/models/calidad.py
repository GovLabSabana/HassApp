from sqlalchemy import Column, Integer, String
from core.db import Base


class Calidad(Base):
    __tablename__ = "calidad"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String(70), nullable=False)  # alta, media, baja
