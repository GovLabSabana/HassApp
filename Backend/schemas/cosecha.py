from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from decimal import Decimal


class CosechaBase(BaseModel):
    fecha: date
    producto_id: int
    calidad_id: int
    toneladas: Decimal
    hectareas: Decimal
    calibre_promedio: Optional[Decimal] = None
    observaciones: Optional[str] = None

    predio_ids: List[int]


class CosechaCreate(CosechaBase):
    pass


class CosechaUpdate(BaseModel):
    fecha: Optional[date] = None
    producto_id: Optional[int] = None
    calidad_id: Optional[int] = None
    toneladas: Optional[Decimal] = None
    hectareas: Optional[Decimal] = None
    calibre_promedio: Optional[Decimal] = None
    observaciones: Optional[str] = None
    predio_ids: Optional[List[int]] = None


class CosechaRead(BaseModel):
    id: int
    fecha: date
    producto_id: int
    calidad_id: int
    toneladas: Decimal
    hectareas: Decimal
    calibre_promedio: Optional[Decimal]
    observaciones: Optional[str]
    predio_ids: Optional[List[int]] = []

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_predios(cls, cosecha_orm):
        # Extrae solo los IDs de los predios relacionados
        predio_ids = [
            p.id for p in cosecha_orm.predios] if cosecha_orm.predios else []
        # Crea una instancia del esquema Pydantic
        data = cls.from_orm(cosecha_orm)
        # Sobrescribe el campo predio_ids con la lista calculada
        data.predio_ids = predio_ids
        return data
