# schemas/certificacion.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from core.db import Base
from sqlalchemy import Column, Integer, String


class Certificacion(Base):
    __tablename__ = "certificacion"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

