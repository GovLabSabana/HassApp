from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorRead
from models.usuario import Usuario
from utils.current_user import current_user
from core.db import get_db
import repositories.proveedor as repo
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.proveedor import Proveedor

router = APIRouter(
    prefix="/proveedores",
    tags=["Proveedores"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=List[ProveedorRead])
async def list_proveedores(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)


@router.get("/{proveedor_id}", response_model=ProveedorRead)
async def get_proveedor(proveedor_id: int, db: AsyncSession = Depends(get_db)):
    proveedor = await repo.get_by_id(db, proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


@router.post("/", response_model=ProveedorRead, status_code=status.HTTP_201_CREATED)
async def create_proveedor(proveedor_in: ProveedorCreate, db: AsyncSession = Depends(get_db)):
    return await repo.create(db, proveedor_in)


@router.put("/{proveedor_id}", response_model=ProveedorRead)
async def update_proveedor(proveedor_id: int, proveedor_in: ProveedorUpdate, db: AsyncSession = Depends(get_db)):
    proveedor = await repo.get_by_id(db, proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return await repo.update_proveedor(db, proveedor_id, proveedor_in)


@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_proveedor(proveedor_id: int, db: AsyncSession = Depends(get_db)):
    # 1️⃣ Carga el proveedor junto con sus insumos
    result = await db.execute(
        select(Proveedor).options(selectinload(Proveedor.insumos)).where(
            Proveedor.id == proveedor_id)
    )
    proveedor = result.scalars().first()

    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    # 2️⃣ Verifica si tiene insumos relacionados
    if proveedor.insumos:
        raise HTTPException(
            status_code=400, detail="No se puede borrar, este proveedor tiene insumos asignados.")

    # 3️⃣ Ahora sí elimina
    await repo.delete_proveedor(db, proveedor_id)
