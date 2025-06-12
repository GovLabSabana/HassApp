# repositories/insumo_cosecha_repository.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from models.insumo_cosecha import InsumoCosecha
from schemas.insumo_cosecha import InsumoCosechaCreate

async def add_insumo_to_cosecha(
    db: AsyncSession, insumo_id: int, ic_in: InsumoCosechaCreate
) -> InsumoCosecha:
    obj = InsumoCosecha(
        insumo_id=insumo_id,
        cosecha_id=ic_in.cosecha_id,
        cantidad=ic_in.cantidad,
    )
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
    except IntegrityError:
        await db.rollback()
        raise
    return obj



async def list_insumos_por_cosecha(
    db: AsyncSession, cosecha_id: int
) -> list[InsumoCosecha]:
    result = await db.execute(
        select(InsumoCosecha).where(InsumoCosecha.cosecha_id == cosecha_id)
    )
    return result.scalars().all()


async def get_insumo_cosecha(
    db: AsyncSession, ic_id: int
) -> Optional[InsumoCosecha]:
    return await db.get(InsumoCosecha, ic_id)


async def delete_insumo_cosecha(db: AsyncSession, db_obj: InsumoCosecha) -> None:
    await db.delete(db_obj)
    await db.commit()
