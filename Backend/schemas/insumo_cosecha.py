from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class InsumoCosechaBase(BaseModel):
    cosecha_id: int
    cantidad: Decimal


class InsumoCosechaCreate(InsumoCosechaBase):
    pass


class InsumoCosechaRead(InsumoCosechaBase):
    id: int
    insumo_id: int
    cosecha_id: int
    cantidad: Decimal
    nombre_comercial: str
    costo_unitario: Decimal
    model_config = ConfigDict(from_attributes=True)
