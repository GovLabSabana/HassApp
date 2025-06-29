from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

# Certificación base (catálogo)
class CertificacionBase(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

# Crear certificación predio (si usas JSON, pero en este caso usas FormData, así que es opcional)
class CertificacionPredioCreate(BaseModel):
    certificacion_id: int
    fecha_expedicion: Optional[date]
    fecha_vencimiento: Optional[date]

# Leer certificación predio
class CertificacionPredioRead(BaseModel):
    id: int
    archivo_pdf: Optional[str]
    fecha_expedicion: Optional[date]
    fecha_vencimiento: Optional[date]
    certificacion: CertificacionBase  # Incluye el nombre desde el catálogo

    model_config = ConfigDict(from_attributes=True)
