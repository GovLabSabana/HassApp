from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from schemas.pregunta import PreguntaOut


class RespuestaBase(BaseModel):
    pregunta_id: int
    respuesta: str


class RespuestaCreate(RespuestaBase):
    pass


class RespuestaOut(RespuestaBase):
    id: int
    fecha: datetime

    class Config:
        orm_mode = True
