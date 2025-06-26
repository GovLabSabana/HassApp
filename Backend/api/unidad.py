# routers/unidad.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.unidad import Unidad
from schemas.unidad import UnidadOut, UnidadIn
from utils.current_user import current_user

router = APIRouter(
    prefix="/unidades",
    tags=["unidades"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=list[UnidadOut])
async def get_all_unidades(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unidad))
    return result.scalars().all()


@router.get("/{nombre}", response_model=UnidadOut)
async def get_unidad(nombre: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unidad).where(Unidad.nombre == nombre))
    unidad = result.scalar_one_or_none()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    return unidad


@router.post("/", response_model=UnidadOut, status_code=201)
async def create_unidad(unidad_in: UnidadIn, db: AsyncSession = Depends(get_db)):
    unidad = Unidad(nombre=unidad_in.nombre)
    db.add(unidad)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Error al crear la unidad (posible duplicado)")
    return unidad


@router.delete("/{nombre}", status_code=204)
async def delete_unidad(nombre: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unidad).where(Unidad.nombre == nombre))
    unidad = result.scalar_one_or_none()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    await db.delete(unidad)
    await db.commit()
