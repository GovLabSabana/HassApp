from pydantic import BaseModel
from typing import Dict


class PreguntaOpcionEstadistica(BaseModel):
    id: int
    texto: str
    conteo_opciones: Dict[str, int]  # opción -> cantidad

    class Config:
        orm_mode = True
