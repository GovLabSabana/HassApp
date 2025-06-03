# schemas/user.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
# Importa el modelo TipoDocumentoRead
from schemas.tipo_documento import TipoDocumentoRead


class UsuarioRead(BaseModel):
    id: int
    email: EmailStr
    nombre: Optional[str]
    tipo_persona: Optional[str]
    razon_social: Optional[str]
    telefono: Optional[str]
    direccion: Optional[str]
    pagina_web: Optional[str]
    rut: Optional[str]
    logo: Optional[str]
    created_at: Optional[datetime]
    tipo_documento_id: Optional[int]
    # Puedes incluir el objeto relacionado (opcional)
    tipo_documento: Optional[TipoDocumentoRead]
    num_documento: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class UsuarioCreate(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    tipo_persona: str
    razon_social: Optional[str]
    telefono: str
    direccion: Optional[str]
    pagina_web: Optional[str]
    rut: Optional[str]
    logo: Optional[str]

    tipo_documento_id: int
    num_documento: Optional[str]

    def create_update_dict(self):
        return self.model_dump(exclude_unset=True)

    def create_update_dict_superuser(self):
        return self.create_update_dict()


class UsuarioUpdate(BaseModel):
    nombre: Optional[str]
    tipo_persona: Optional[str]
    razon_social: Optional[str]
    telefono: Optional[str]
    direccion: Optional[str]
    pagina_web: Optional[str]
    rut: Optional[str]
    logo: Optional[str]

    tipo_documento_id: Optional[int]
    num_documento: Optional[str]
