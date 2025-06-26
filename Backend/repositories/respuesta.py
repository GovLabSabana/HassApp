from schemas.estadistica import EstadoRespuestasMensual
from datetime import datetime
from sqlalchemy import select, extract
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


async def get_estado_respuestas_produccion(db: AsyncSession, user_id: int) -> EstadoRespuestasMensual:
    current_date = datetime.utcnow()
    mes = current_date.month
    anio = current_date.year

    stmt = select(Respuesta.pregunta_id).where(
        Respuesta.usuario_id == user_id,
        extract("month", Respuesta.fecha) == mes,
        extract("year", Respuesta.fecha) == anio,
        Respuesta.pregunta_id.in_([10, 11])
    )

    result = await db.execute(stmt)
    ids = {row[0] for row in result.fetchall()}

    return EstadoRespuestasMensual(
        produccion_estimada=10 in ids,
        produccion_real=11 in ids
    )
