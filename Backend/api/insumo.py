from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.db import get_db
from schemas.insumos import InsumoCreate, InsumoRead, InsumoUpdate
from repositories.insumos import InsumoRepository

router = APIRouter(prefix="/insumos", tags=["Insumos"])

@router.post("/", response_model=InsumoRead, status_code=status.HTTP_201_CREATED)
async def create_insumo(
    insumo_in: InsumoCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoRepository(db)
    return await repo.create(insumo_in)

@router.get("/", response_model=List[InsumoRead])
async def list_insumos(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoRepository(db)
    return await repo.list(skip=skip, limit=limit)

@router.get("/{insumo_id}", response_model=InsumoRead)
async def get_insumo(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoRepository(db)
    insumo = await repo.get(insumo_id)
    if not insumo:
        raise HTTPException(404, "Insumo no encontrado")
    return insumo

@router.put("/{insumo_id}", response_model=InsumoRead)
async def update_insumo(
    insumo_id: int,
    insumo_in: InsumoUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoRepository(db)
    insumo = await repo.get(insumo_id)
    if not insumo:
        raise HTTPException(404, "Insumo no encontrado")
    return await repo.update(insumo, insumo_in)

@router.delete("/{insumo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insumo(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoRepository(db)
    insumo = await repo.get(insumo_id)
    if not insumo:
        raise HTTPException(404, "Insumo no encontrado")
    await repo.delete(insumo)
