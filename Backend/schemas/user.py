# schemas/user.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserRead(BaseModel):
    id: int
    email: EmailStr
    nombre: Optional[str]
    tipo_persona: Optional[str]
    razon_social: Optional[str]
    telefono: Optional[str]
    direccion: Optional[str]
    pagina_web: Optional[str]
    rut: Optional[str]
    cedula: Optional[str]
    logo: Optional[str]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    tipo_persona: str
    razon_social: Optional[str]
    telefono: str
    direccion: Optional[str]
    pagina_web: Optional[str]
    cedula: str
    rut: Optional[str]
    logo: Optional[str]

    def create_update_dict(self):
        return self.model_dump(exclude_unset=True)

    def create_update_dict_superuser(self):
        # Puedes devolver lo mismo o agregar campos extra para superuser
        return self.create_update_dict()


class UserUpdate(BaseModel):
    email: Optional[EmailStr]
    nombre: Optional[str]
    tipo_persona: Optional[str]
    razon_social: Optional[str]
    telefono: Optional[str]
    direccion: Optional[str]
    pagina_web: Optional[str]
    rut: Optional[str]
    cedula: Optional[str]
    logo: Optional[str]
