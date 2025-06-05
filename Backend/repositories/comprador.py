from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.comprador import Comprador
from schemas.comprador import CompradorCreate, CompradorUpdate


async def get_all(db: AsyncSession):
    result = await db.execute(select(Comprador))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, comprador_id: int):
    result = await db.execute(
        select(Comprador).where(Comprador.id == comprador_id)
    )
    return result.scalars().first()


async def create(db: AsyncSession, comprador: CompradorCreate):
    db_comprador = Comprador(**comprador.dict())
    db.add(db_comprador)
    await db.commit()
    await db.refresh(db_comprador)
    return db_comprador


async def update(db: AsyncSession, comprador_id: int, comprador_data: CompradorUpdate):
    db_comprador = await get_by_id(db, comprador_id)
    if db_comprador:
        for key, value in comprador_data.dict(exclude_unset=True).items():
            setattr(db_comprador, key, value)
        await db.commit()
        await db.refresh(db_comprador)
    return db_comprador


async def delete(db: AsyncSession, comprador_id: int):
    db_comprador = await get_by_id(db, comprador_id)
    if db_comprador:
        await db.delete(db_comprador)
        await db.commit()
    return db_comprador
