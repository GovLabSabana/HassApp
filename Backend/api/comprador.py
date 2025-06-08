from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from schemas.comprador import CompradorCreate, CompradorOut, CompradorUpdate
from repositories import comprador as comprador_repo
from utils.current_user import current_user

router = APIRouter(prefix="/compradores",
                   tags=["compradores"], dependencies=[Depends(current_user)])


@router.get("/", response_model=list[CompradorOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await comprador_repo.get_all(db)


@router.get("/{comprador_id}", response_model=CompradorOut)
async def get_one(comprador_id: int, db: AsyncSession = Depends(get_db)):
    comprador = await comprador_repo.get_by_id(db, comprador_id)
    if not comprador:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return comprador


@router.post("/", response_model=CompradorOut)
async def create(comprador: CompradorCreate, db: AsyncSession = Depends(get_db)):
    return await comprador_repo.create(db, comprador)


@router.put("/{comprador_id}", response_model=CompradorOut)
async def update(comprador_id: int, comprador: CompradorUpdate, db: AsyncSession = Depends(get_db)):
    comprador_actualizado = await comprador_repo.update(db, comprador_id, comprador)
    if not comprador_actualizado:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return comprador_actualizado


@router.delete("/{comprador_id}")
async def delete(comprador_id: int, db: AsyncSession = Depends(get_db)):
    eliminado = await comprador_repo.delete(db, comprador_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return {"detail": "Comprador eliminado"}
