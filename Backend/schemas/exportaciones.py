from optparse import Option
from typing import List, Optional
from pydantic import BaseModel
from pydantic.config import ConfigDict
from datetime import date
from schemas.cosecha import CosechaRead


class ExportacionBase(BaseModel):
    fecha: date
    metodo_salida: Optional[str]
    toneladas: Optional[float]
    valor_fob: Optional[float]
    puerto_salida: Optional[str]
    puerto_llegada: Optional[str]
    comprador_id: int


class ExportacionCreate(ExportacionBase):
    cosecha_ids: List[int]  # para crear con relaciones


class ExportacionUpdate(BaseModel):
    fecha: Optional[date] = None
    metodo_salida: Optional[str] = None
    toneladas: Optional[float] = None
    valor_fob: Optional[float] = None
    puerto_salida: Optional[str] = None
    puerto_llegada: Optional[str] = None
    comprador_id: Optional[int] = None
    cosecha_ids: Optional[List[int]] = None


class ExportacionOut(ExportacionBase):
    id: int
    cosecha_ids: Optional[List[int]] = []

    model_config = ConfigDict(from_attributes=True)


class ExportacionOutWithCosechas(ExportacionOut):
    cosechas: Optional[List[CosechaRead]] = []
    comprador: Optional[str] = None  # Aquí irá el nombre del comprador
