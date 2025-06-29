from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.certificacion import Certificacion
from models.certificacion_predio import CertificacionPredio
from schemas.certificaciones import CertificacionCreate, CertificacionRead, CertificacionUpdate


router = APIRouter(prefix="/certificaciones", tags=["certificaciones"])

@router.get("/", response_model=list[CertificacionRead])
async def listar_certificaciones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certificacion))
    return result.scalars().all()

# POST - Crear certificación
@router.post("/", response_model=CertificacionRead)
async def crear_certificacion(cert: CertificacionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certificacion).where(Certificacion.nombre == cert.nombre))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe una certificación con ese nombre")
    nueva = Certificacion(nombre=cert.nombre)
    db.add(nueva)
    await db.commit()
    await db.refresh(nueva)
    return nueva

# PUT - Actualizar certificación
@router.put("/{certificacion_id}", response_model=CertificacionRead)
async def actualizar_certificacion(certificacion_id: int, cert: CertificacionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certificacion).where(Certificacion.id == certificacion_id))
    existente = result.scalar_one_or_none()
    if not existente:
        raise HTTPException(status_code=404, detail="Certificación no encontrada")
    existente.nombre = cert.nombre
    await db.commit()
    await db.refresh(existente)
    return existente

# DELETE - Eliminar certificación
@router.delete("/{certificacion_id}")
async def eliminar_certificacion(certificacion_id: int, db: AsyncSession = Depends(get_db)):
    # Verifica si existe la certificación
    result = await db.execute(select(Certificacion).where(Certificacion.id == certificacion_id))
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificación no encontrada")

    # Verifica si está en uso en certificacion_predio
    result = await db.execute(
        select(CertificacionPredio).where(CertificacionPredio.certificacion_id == certificacion_id)
    )
    en_uso = result.scalar_one_or_none()
    if en_uso:
        raise HTTPException(status_code=400, detail="No se puede eliminar: está asociada a uno o más predios")

    # Si no está en uso, eliminar
    await db.delete(cert)
    await db.commit()
    return {"msg": "Certificación eliminada correctamente"}

