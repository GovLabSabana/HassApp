from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from repositories.exportaciones import get_all_raw, get_by_id_raw
from schemas.cosecha import CosechaRead
from repositories import exportaciones as repo
from models.usuario import Usuario

from sqlalchemy.ext.asyncio import AsyncSession

from core.db import get_db
from repositories.exportaciones import (
    get_all as get_all_exportaciones,
    get_by_id as get_exportacion_by_id,
    create as create_exportacion,
    update as update_exportacion,
    delete as delete_exportacion,
)
from schemas.exportaciones import (
    ExportacionCreate,
    ExportacionUpdate,
    ExportacionOutWithCosechas,
)
from utils.current_user import current_user

router = APIRouter(prefix="/exportaciones",
                   tags=["Exportaciones"], dependencies=[Depends(current_user)])


@router.get("/", response_model=List[ExportacionOutWithCosechas])
async def list_exportaciones(db: AsyncSession = Depends(get_db), user: Usuario = Depends(current_user)):
    orm_list = await repo.get_all_raw(db, user.id)
    salida: List[ExportacionOutWithCosechas] = []
    for exp in orm_list:
        cosechas_read = [CosechaRead.from_orm_with_predios(
            rel.cosecha) for rel in exp.cosechas]
        salida.append(
            ExportacionOutWithCosechas(
                id=exp.id,
                fecha=exp.fecha,
                metodo_salida=exp.metodo_salida,
                toneladas=float(
                    exp.toneladas) if exp.toneladas is not None else None,
                valor_fob=float(
                    exp.valor_fob) if exp.valor_fob is not None else None,
                puerto_salida=exp.puerto_salida,
                puerto_llegada=exp.puerto_llegada,
                comprador_id=exp.comprador_id,
                cosecha_ids=[rel.cosecha_id for rel in exp.cosechas],
                cosechas=cosechas_read,
            )
        )
    return salida


@router.post("/", response_model=ExportacionOutWithCosechas, status_code=status.HTTP_201_CREATED)
async def create_exportacion(export_in: ExportacionCreate, db: AsyncSession = Depends(get_db), user: Usuario = Depends(current_user)):
    new_raw = await repo.create(db, export_in, user.id)
    exp = await repo.get_by_id_raw(db, new_raw.id)
    if not exp:
        raise HTTPException(
            status_code=500, detail="Error interno al crear exportación")
    cosechas_read = [CosechaRead.from_orm_with_predios(
        rel.cosecha) for rel in exp.cosechas]
    return ExportacionOutWithCosechas(
        id=exp.id,
        fecha=exp.fecha,
        metodo_salida=exp.metodo_salida,
        toneladas=float(exp.toneladas) if exp.toneladas is not None else None,
        valor_fob=float(exp.valor_fob) if exp.valor_fob is not None else None,
        puerto_salida=exp.puerto_salida,
        puerto_llegada=exp.puerto_llegada,
        comprador_id=exp.comprador_id,
        cosecha_ids=[rel.cosecha_id for rel in exp.cosechas],
        cosechas=cosechas_read,
    )


@router.get("/{exportacion_id}", response_model=ExportacionOutWithCosechas)
async def get_exportacion(exportacion_id: int, db: AsyncSession = Depends(get_db)):
    exp = await repo.get_by_id_raw(db, exportacion_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Exportación no encontrada")
    cosechas_read = [CosechaRead.from_orm_with_predios(
        rel.cosecha) for rel in exp.cosechas]
    return ExportacionOutWithCosechas(
        id=exp.id,
        fecha=exp.fecha,
        metodo_salida=exp.metodo_salida,
        toneladas=float(exp.toneladas) if exp.toneladas is not None else None,
        valor_fob=float(exp.valor_fob) if exp.valor_fob is not None else None,
        puerto_salida=exp.puerto_salida,
        puerto_llegada=exp.puerto_llegada,
        comprador_id=exp.comprador_id,
        cosecha_ids=[rel.cosecha_id for rel in exp.cosechas],
        cosechas=cosechas_read,
    )


@router.put("/{exportacion_id}", response_model=ExportacionOutWithCosechas)
async def update_exportacion(exportacion_id: int, export_in: ExportacionUpdate, db: AsyncSession = Depends(get_db)):
    updated = await repo.update(db, exportacion_id, export_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Exportación no encontrada")
    exp = await repo.get_by_id_raw(db, exportacion_id)
    cosechas_read = [CosechaRead.from_orm_with_predios(
        rel.cosecha) for rel in exp.cosechas]
    return ExportacionOutWithCosechas(
        id=exp.id,
        fecha=exp.fecha,
        metodo_salida=exp.metodo_salida,
        toneladas=float(exp.toneladas) if exp.toneladas is not None else None,
        valor_fob=float(exp.valor_fob) if exp.valor_fob is not None else None,
        puerto_salida=exp.puerto_salida,
        puerto_llegada=exp.puerto_llegada,
        comprador_id=exp.comprador_id,
        cosecha_ids=[rel.cosecha_id for rel in exp.cosechas],
        cosechas=cosechas_read,
    )


@router.delete("/{exportacion_id}", response_model=ExportacionOutWithCosechas)
async def delete_exportacion(exportacion_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await repo.delete(db, exportacion_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Exportación no encontrada")
    cosechas_read = [CosechaRead.from_orm_with_predios(
        rel.cosecha) for rel in deleted.cosechas]
    return ExportacionOutWithCosechas(
        id=deleted.id,
        fecha=deleted.fecha,
        metodo_salida=deleted.metodo_salida,
        toneladas=float(
            deleted.toneladas) if deleted.toneladas is not None else None,
        valor_fob=float(
            deleted.valor_fob) if deleted.valor_fob is not None else None,
        puerto_salida=deleted.puerto_salida,
        puerto_llegada=deleted.puerto_llegada,
        comprador_id=deleted.comprador_id,
        cosecha_ids=[rel.cosecha_id for rel in deleted.cosechas],
        cosechas=cosechas_read,
    )
