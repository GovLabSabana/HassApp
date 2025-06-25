from typing import Dict
from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)
