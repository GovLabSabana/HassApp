# schemas/insumo.py
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class InsumoBase(BaseModel):
    nombre_comercial: str
    unidad: str
    categoria_id: int
    proveedor_id: int
    costo_unitario: Decimal

class InsumoCreate(InsumoBase):
    pass

class InsumoRead(InsumoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
