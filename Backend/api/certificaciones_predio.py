# api/certificaciones_predio.py

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.certificacion_predio import CertificacionPredio
from models.predio import Predio
from models.certificacion import Certificacion
from utils.current_user import current_user
from models.usuario import Usuario
from schemas.certificacion_predio import CertificacionPredioRead, CertificacionPredioUpdate, CertificacionPredioCreate
import shutil
import os
from datetime import date
from typing import Optional
from sqlalchemy.orm import selectinload
from core.s3 import upload_file_to_s3, delete_file_from_s3
from urllib.parse import urlparse
from fastapi import Query



import uuid

router = APIRouter(prefix="/certificaciones-predio", tags=["certificaciones_predio"])


@router.post("/", response_model=CertificacionPredioRead)
async def crear_certificacion_predio(
    certificacion_id: int = Form(...),
    predio_id: int = Form(...),
    fecha_expedicion: date = Form(None),
    fecha_vencimiento: date = Form(None),
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    # Validar propiedad del predio
    result = await db.execute(
        select(Predio).where(Predio.id == predio_id, Predio.usuario_id == user.id)
    )
    predio = result.scalar_one_or_none()
    if not predio:
        raise HTTPException(status_code=404, detail="Predio no encontrado o no autorizado")

    # Subir archivo a S3
    nombre_unico = f"certificaciones/{uuid.uuid4()}_{archivo.filename}"
    url_archivo_pdf = upload_file_to_s3(archivo.file, nombre_unico)

    # Crear registro
    nueva = CertificacionPredio(
        predio_id=predio_id,
        certificacion_id=certificacion_id,
        fecha_expedicion=fecha_expedicion,
        fecha_vencimiento=fecha_vencimiento,
        archivo_pdf=url_archivo_pdf
    )
    db.add(nueva)
    await db.commit()
    await db.refresh(nueva)
    return nueva

@router.get("/detalle/{certificacion_predio_id}", response_model=CertificacionPredioRead)
async def obtener_certificacion_predio(
    certificacion_predio_id: int,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    result = await db.execute(
        select(CertificacionPredio)
        .join(Predio)
        .where(
            CertificacionPredio.id == certificacion_predio_id,
            Predio.usuario_id == user.id
        )
        .options(selectinload(CertificacionPredio.certificacion))
    )
    cert = result.scalar_one_or_none()
    
    if not cert:
        raise HTTPException(status_code=404, detail="Certificación no encontrada o no autorizada")
    
    return cert



@router.get("/{predio_id}", response_model=list[CertificacionPredioRead])
async def listar_certificaciones_de_predio(
    predio_id: int,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    result = await db.execute(
        select(CertificacionPredio)
        .join(Predio)
        .where(CertificacionPredio.predio_id == predio_id, Predio.usuario_id == user.id)
        .options(selectinload(CertificacionPredio.certificacion))
    )
    return result.scalars().all()


@router.put("/{certificacion_predio_id}", response_model=CertificacionPredioRead)
async def actualizar_certificacion_predio(
    certificacion_predio_id: int,
    certificacion_id: int = Form(...),
    fecha_expedicion: date = Form(None),
    fecha_vencimiento: date = Form(None),
    archivo: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    # Buscar la certificación del predio y validar que el usuario sea dueño
    result = await db.execute(
        select(CertificacionPredio)
        .join(Predio)
        .where(
            CertificacionPredio.id == certificacion_predio_id,
            Predio.usuario_id == user.id
        )
    )
    cert = result.scalar_one_or_none()

    if not cert:
        raise HTTPException(status_code=404, detail="Certificación no encontrada o no autorizada")

    # Actualizar campos
    cert.certificacion_id = certificacion_id
    cert.fecha_expedicion = fecha_expedicion
    cert.fecha_vencimiento = fecha_vencimiento

    # Subir nuevo archivo a S3 si viene uno
    if archivo:
        s3_key = f"certificaciones/{uuid.uuid4()}_{archivo.filename}"
        url = upload_file_to_s3(archivo.file, s3_key)
        cert.archivo_pdf = url

    await db.commit()
    await db.refresh(cert)
    return cert



@router.delete("/{certificacion_predio_id}")
async def eliminar_certificacion_predio(
    certificacion_predio_id: int,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    result = await db.execute(
        select(CertificacionPredio)
        .join(Predio)
        .where(CertificacionPredio.id == certificacion_predio_id, Predio.usuario_id == user.id)
    )
    cert = result.scalar_one_or_none()

    if not cert:
        raise HTTPException(status_code=404, detail="Certificación del predio no encontrada o no autorizada")

    # Eliminar el archivo de S3 (opcional)
    if cert.archivo_pdf:
        parsed_url = urlparse(cert.archivo_pdf)
        s3_key = parsed_url.path.lstrip("/")  # Quitar el "/"
        delete_file_from_s3(s3_key)

    await db.delete(cert)
    await db.commit()

    return {"msg": "Certificación eliminada exitosamente"}
