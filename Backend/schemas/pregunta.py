from typing import Dict
from pydantic import BaseModel
from typing import Optional, List


class PreguntaBase(BaseModel):
    texto: str
    clave: str
    tipo: str
    opciones: Optional[List[str]] = None


class PreguntaCreate(PreguntaBase):
    pass


class PreguntaOut(PreguntaBase):
    id: int

    class Config:
        orm_mode = True


class PreguntaOpcionEstadistica(BaseModel):
    id: int
    texto: str
    conteo_opciones: Dict[str, int]  # opción -> cantidad

    class Config:
        orm_mode = True
