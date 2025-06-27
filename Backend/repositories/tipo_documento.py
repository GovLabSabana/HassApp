from sqlalchemy.ext.asyncio import AsyncSession
from models.tipo_documento import TipoDocumento
from sqlalchemy.future import select


async def get_all(db: AsyncSession):
    result = await db.execute(select(TipoDocumento))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, tipo_documento_id: int):
    result = await db.execute(
        select(TipoDocumento).where(TipoDocumento.id == tipo_documento_id)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, name: str):
    nuevo_tipo = TipoDocumento(name=name)
    db.add(nuevo_tipo)
    await db.commit()
    await db.refresh(nuevo_tipo)
    return nuevo_tipo


async def update(db: AsyncSession, tipo_documento_id: int, name: str):
    tipo = await get_by_id(db, tipo_documento_id)
    if tipo:
        tipo.name = name
        await db.commit()
        await db.refresh(tipo)
    return tipo


async def delete(db: AsyncSession, tipo_documento_id: int):
    tipo = await get_by_id(db, tipo_documento_id)
    if tipo:
        await db.delete(tipo)
        await db.commit()
    return tipo
