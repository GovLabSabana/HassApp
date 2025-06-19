from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from models.proveedor import Proveedor
from schemas.proveedor import ProveedorCreate, ProveedorUpdate


async def get_all(db: AsyncSession):
    result = await db.execute(select(Proveedor))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, proveedor_id: int):
    result = await db.execute(select(Proveedor).where(Proveedor.id == proveedor_id))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, proveedor_in: ProveedorCreate) -> Proveedor:
    proveedor = Proveedor(**proveedor_in.dict())
    db.add(proveedor)
    await db.commit()
    await db.refresh(proveedor)
    return proveedor


async def update_proveedor(db: AsyncSession, proveedor_id: int, proveedor_in: ProveedorUpdate):
    update_data = {k: v for k, v in proveedor_in.dict(
        exclude_unset=True).items()}
    if not update_data:
        return await get_by_id(db, proveedor_id)  # Nada que actualizar
    await db.execute(
        update(Proveedor)
        .where(Proveedor.id == proveedor_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_by_id(db, proveedor_id)


async def delete_proveedor(db: AsyncSession, proveedor_id: int):
    await db.execute(delete(Proveedor).where(Proveedor.id == proveedor_id))
    await db.commit()
