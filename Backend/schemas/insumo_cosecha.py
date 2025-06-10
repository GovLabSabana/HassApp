from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class InsumoCosechaBase(BaseModel):
    insumo_id: int
    cantidad: Decimal
    costo_unitario: Decimal


class InsumoCosechaCreate(InsumoCosechaBase):
    pass


class InsumoCosechaRead(InsumoCosechaBase):
    id: int
    nombre_comercial: str
    model_config = ConfigDict(from_attributes=True)
