from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.db import get_db
from schemas.insumo_cosecha import (
    InsumoCosechaCreate,
    InsumoCosechaRead,
    InsumoCosechaUpdate,
)
from repositories.insumo_cosechas import InsumoCosechaRepository

router = APIRouter(prefix="/insumo-cosechas", tags=["InsumoCosechas"])

@router.post("/", response_model=InsumoCosechaRead, status_code=status.HTTP_201_CREATED)
async def create_ic(
    ic_in: InsumoCosechaCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoCosechaRepository(db)
    return await repo.create(ic_in)

@router.get("/", response_model=List[InsumoCosechaRead])
async def list_ic(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoCosechaRepository(db)
    return await repo.list(skip=skip, limit=limit)

@router.get("/{ic_id}", response_model=InsumoCosechaRead)
async def get_ic(
    ic_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoCosechaRepository(db)
    ic = await repo.get(ic_id)
    if not ic:
        raise HTTPException(404, "Registro no encontrado")
    return ic

@router.put("/{ic_id}", response_model=InsumoCosechaRead)
async def update_ic(
    ic_id: int,
    ic_in: InsumoCosechaUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoCosechaRepository(db)
    ic = await repo.get(ic_id)
    if not ic:
        raise HTTPException(404, "Registro no encontrado")
    return await repo.update(ic, ic_in)

@router.delete("/{ic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ic(
    ic_id: int,
    db: AsyncSession = Depends(get_db),
):
    repo = InsumoCosechaRepository(db)
    ic = await repo.get(ic_id)
    if not ic:
        raise HTTPException(404, "Registro no encontrado")
    await repo.delete(ic)
