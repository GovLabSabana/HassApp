from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.respuesta import Respuesta
from schemas.respuesta import RespuestaCreate
from sqlalchemy.orm import selectinload


async def get_all(db: AsyncSession):
    result = await db.execute(select(Respuesta).options())
    return result.scalars().all()


async def get_by_id(db: AsyncSession, respuesta_id: int):
    result = await db.execute(select(Respuesta).where(Respuesta.id == respuesta_id))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, respuesta: RespuestaCreate):
    new_respuesta = respuesta
    db.add(new_respuesta)
    await db.commit()
    await db.refresh(new_respuesta)

    # Precargar la relación 'pregunta' de forma segura
    result = await db.execute(
        select(Respuesta)
        .options(selectinload(Respuesta.pregunta))
        .where(Respuesta.id == new_respuesta.id)
    )
    return result.scalar_one()


async def delete(db: AsyncSession, respuesta_id: int):
    respuesta = await get_by_id(db, respuesta_id)
    if not respuesta:
        return False
    await db.delete(respuesta)
    await db.commit()
    return True
