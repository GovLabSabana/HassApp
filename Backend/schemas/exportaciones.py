from typing import List, Optional
from pydantic import BaseModel
from datetime import date

class ExportacionBase(BaseModel):
    fecha: date
    metodo_salida: Optional[str]
    toneladas: Optional[float]
    valor_fob: Optional[float]
    puerto_salida: Optional[str]
    puerto_llegada: Optional[str]
    comprador_id: int

class ExportacionCreate(ExportacionBase):
    cosecha_ids: List[int]  # <- para crear con relaciones

class ExportacionUpdate(ExportacionBase):
    cosecha_ids: Optional[List[int]] = None  # <- para actualizar relaciones

class ExportacionOut(ExportacionBase):
    id: int
    cosecha_ids: List[int]  # <- para ver relaciones en GET

    class Config:
        from_attributes = True  # <- reemplaza orm_mode en Pydantic v2
