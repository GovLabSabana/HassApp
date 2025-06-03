from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from typing import List, Optional
from models.cosecha import Cosecha
from models.predio import Predio
from schemas.cosecha import CosechaCreate, CosechaUpdate
from sqlalchemy.orm import selectinload


async def create_cosecha(db: AsyncSession, cosecha_in: CosechaCreate) -> Cosecha:

    cosecha = Cosecha(
        fecha=cosecha_in.fecha,
        producto_id=cosecha_in.producto_id,
        calidad_id=cosecha_in.calidad_id,
        toneladas=cosecha_in.toneladas,
        hectareas=cosecha_in.hectareas,
        calibre_promedio=cosecha_in.calibre_promedio,
        observaciones=cosecha_in.observaciones,

    )
    if cosecha_in.predio_ids:
        result = await db.execute(
            select(Predio).where(Predio.id.in_(cosecha_in.predio_ids))
        )
        predios = result.scalars().all()
        cosecha.predios = predios
    db.add(cosecha)
    await db.commit()

    result = await db.execute(
        select(Cosecha)
        .options(selectinload(Cosecha.predios))
        .where(Cosecha.id == cosecha.id)
    )
    cosecha = result.scalars().first()

    return cosecha


async def get_cosechas_by_predio(db: AsyncSession, predio_id: int) -> List[Cosecha]:
    result = await db.execute(
        select(Cosecha).join(Cosecha.predios).where(Predio.id == predio_id)
    )
    return result.scalars().all()


async def get_cosecha(db: AsyncSession, cosecha_id: int) -> Optional[Cosecha]:
    result = await db.execute(
        select(Cosecha).where(Cosecha.id == cosecha_id)
    )
    return result.scalar_one_or_none()


async def update_cosecha(db: AsyncSession, cosecha: Cosecha, cosecha_in: CosechaUpdate) -> Cosecha:
    # Actualiza campos simples
    update_data = cosecha_in.dict(exclude_unset=True, exclude={"predio_ids"})
    for field, value in update_data.items():
        setattr(cosecha, field, value)

    # Manejo EXPLÍCITO de predio_ids
    if hasattr(cosecha_in, "predio_ids") and cosecha_in.predio_ids is not None:
        # 1. Cargar relación actual explícitamente
        await db.refresh(cosecha, ["predios"])

        # 2. Limpiar relaciones existentes
        cosecha.predios.clear()

        # 3. Obtener nuevos predios
        stmt = select(Predio).where(Predio.id.in_(cosecha_in.predio_ids))
        result = await db.execute(stmt)
        nuevos_predios = result.scalars().all()

        # 4. Asignar nuevos predios
        cosecha.predios.extend(nuevos_predios)

    await db.commit()

    # Recargar todo el objeto con relaciones
    await db.refresh(cosecha)
    return cosecha


async def delete_cosecha(db: AsyncSession, cosecha: Cosecha) -> None:
    await db.delete(cosecha)
    await db.commit()
