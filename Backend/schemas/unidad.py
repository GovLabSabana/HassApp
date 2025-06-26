# schemas/unidad.py
from pydantic import BaseModel, ConfigDict


class UnidadOut(BaseModel):
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class UnidadIn(BaseModel):
    nombre: str
