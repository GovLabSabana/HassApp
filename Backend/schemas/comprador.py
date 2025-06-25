from pydantic import BaseModel, ConfigDict
from typing import Optional


class CompradorBase(BaseModel):
    nombre: str
    tipo_doc: int
    num_doc: str
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    contacto: Optional[str] = None


class CompradorCreate(CompradorBase):
    pass


class CompradorUpdate(CompradorBase):
    pass


class CompradorOut(CompradorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
