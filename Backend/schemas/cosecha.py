from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from decimal import Decimal

from schemas.predio import PredioNombreOnly
from schemas.insumo_cosecha import InsumoCosechaCreate, InsumoCosechaRead


class CosechaBase(BaseModel):
    fecha: date
    producto_id: int
    calidad_id: int
    toneladas: Decimal
    hectareas: Decimal
    calibre_promedio: Optional[Decimal] = None
    observaciones: Optional[str] = None

    predio_ids: List[int]
    insumos: List[InsumoCosechaCreate]


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
    insumos: Optional[List[InsumoCosechaCreate]] = None


class CosechaRead(BaseModel):
    id: int
    fecha: date
    producto_id: int
    calidad_id: int
    toneladas: Decimal
    hectareas: Decimal
    calibre_promedio: Optional[Decimal]
    observaciones: Optional[str]
    predios: Optional[List[PredioNombreOnly]] = []
    insumos: Optional[List[InsumoCosechaRead]] = []

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_predios(cls, cosecha_orm):
        insumos = [
            InsumoCosechaRead(
                id=ic.id,
                insumo_id=ic.insumo_id,
                cantidad=ic.cantidad,
                costo_unitario=ic.costo_unitario,
                nombre_comercial=ic.insumo.nombre_comercial
            )
            for ic in cosecha_orm.insumos_cosecha
        ] if cosecha_orm.insumos_cosecha else []

        data = cls.from_orm(cosecha_orm)
        data.insumos = insumos
        return data
