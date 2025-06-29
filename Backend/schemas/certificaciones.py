# schemas/certificacion.py
from pydantic import BaseModel, ConfigDict

class CertificacionBase(BaseModel):
    nombre: str

class CertificacionCreate(CertificacionBase):
    pass

class CertificacionUpdate(CertificacionBase):
    pass

class CertificacionRead(CertificacionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
