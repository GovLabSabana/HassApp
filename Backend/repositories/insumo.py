# repositories/insumo_repository.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from models.insumo import Insumo
from schemas.insumo import InsumoCreate

async def get_insumo(db: AsyncSession, insumo_id: int) -> Optional[Insumo]:
    return await db.get(Insumo, insumo_id)


async def list_insumos(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Insumo]:
    result = await db.execute(
        select(Insumo).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def create_insumo(db: AsyncSession, insumo_in: InsumoCreate) -> Insumo:
    obj = Insumo(**insumo_in.model_dump())
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
    except IntegrityError:
        await db.rollback()
        raise
    return obj


async def update_insumo(db: AsyncSession, db_obj: Insumo, insumo_in: InsumoCreate) -> Insumo:
    for campo, valor in insumo_in.model_dump().items():
        setattr(db_obj, campo, valor)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_insumo(db: AsyncSession, db_obj: Insumo) -> None:
    await db.delete(db_obj)
    await db.commit()
