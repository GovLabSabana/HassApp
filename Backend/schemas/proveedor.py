from pydantic import BaseModel
from typing import Optional


class ProveedorBase(BaseModel):
    nombre: str
    tipo_doc: int
    num_doc: str
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    contacto: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_doc: Optional[int] = None
    num_doc: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    contacto: Optional[str] = None


class ProveedorRead(ProveedorBase):
    id: int

    class Config:
        orm_mode = True
