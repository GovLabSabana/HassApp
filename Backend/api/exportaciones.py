from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from schemas.exportaciones import ExportacionCreate, ExportacionUpdate, ExportacionOut
from repositories import exportaciones as repo
from utils.current_user import current_user

router = APIRouter(prefix="/exportaciones",
                   tags=["exportaciones"], dependencies=[Depends(current_user)])


@router.get("/", response_model=list[ExportacionOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)


@router.get("/{exportacion_id}", response_model=ExportacionOut)
async def get_one(exportacion_id: int, db: AsyncSession = Depends(get_db)):
    exportacion = await repo.get_by_id(db, exportacion_id)
    if not exportacion:
        raise HTTPException(
            status_code=404, detail="Exportación no encontrada")
    return exportacion


@router.post("/", response_model=ExportacionOut)
async def create(exportacion: ExportacionCreate, db: AsyncSession = Depends(get_db)):
    """
    Crea una nueva exportación y la asocia a una lista de cosechas (cosecha_ids).
    """
    return await repo.create(db, exportacion)


@router.put("/{exportacion_id}", response_model=ExportacionOut)
async def update(exportacion_id: int, exportacion: ExportacionUpdate, db: AsyncSession = Depends(get_db)):
    """
    Actualiza una exportación existente. También puedes pasar `cosecha_ids` para actualizar la relación.
    """
    updated = await repo.update(db, exportacion_id, exportacion)
    if not updated:
        raise HTTPException(
            status_code=404, detail="Exportación no encontrada")
    return updated


@router.delete("/{exportacion_id}")
async def delete(exportacion_id: int, db: AsyncSession = Depends(get_db)):
    """
    Elimina una exportación y sus relaciones con cosechas.
    """
    deleted = await repo.delete(db, exportacion_id)
    if not deleted:
        raise HTTPException(
            status_code=404, detail="Exportación no encontrada")
    return {"detail": "Exportación eliminada"}
