from sqlalchemy import Column, Integer, String
from core.db import Base
from sqlalchemy.orm import relationship


class Producto(Base):
    __tablename__ = "producto"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(70), nullable=False)  # aguacate hass, etc.

    cosechas = relationship(
        "Cosecha", back_populates="producto", cascade="all, delete-orphan")
