# schemas/predio.py
from pydantic import BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from decimal import Decimal


class PredioBase(BaseModel):
    nombre: str
    cedula_catastral: int
    municipio_id: int
    vereda: Optional[str]
    direccion: Optional[str]
    hectareas: Optional[Decimal]
    vocacion: Optional[str]
    altitud_promedio: Optional[Decimal]
    tipo_riego: Optional[str]

    @field_validator("hectareas", "altitud_promedio", mode="before")
    @classmethod
    def convertir_a_decimal(cls, v):
        if v is None:
            return v
        return Decimal(str(v))


class PredioCreate(PredioBase):
    pass


class PredioUpdate(BaseModel):
    nombre: Optional[str] = None
    cedula_catastral: Optional[int] = None
    municipio_id: Optional[int] = None
    vereda: Optional[str] = None
    direccion: Optional[str] = None
    hectareas: Optional[Decimal] = None
    vocacion: Optional[str] = None
    altitud_promedio: Optional[Decimal] = None
    tipo_riego: Optional[str] = None


class PredioRead(PredioBase):
    id: int
    usuario_id: int
    model_config = ConfigDict(from_attributes=True)


class PredioNombreOnly(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)
