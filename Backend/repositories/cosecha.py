from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from typing import List, Optional
from models.cosecha import Cosecha
from models.predio import Predio
from schemas.cosecha import CosechaCreate, CosechaUpdate
from sqlalchemy.orm import selectinload
from models.insumo_cosecha import InsumoCosecha
from schemas.cosecha import CosechaCreate


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

    # Asociar predios
    if cosecha_in.predio_ids:
        result = await db.execute(
            select(Predio).where(Predio.id.in_(cosecha_in.predio_ids))
        )
        predios = result.scalars().all()
        cosecha.predios = predios

    # Asociar insumos (InsumoCosecha)
    if cosecha_in.insumos:
        cosecha.insumos_cosecha = [
            InsumoCosecha(
                insumo_id=insumo.insumo_id,
                cantidad=insumo.cantidad,
                costo_unitario=insumo.costo_unitario
            )
            for insumo in cosecha_in.insumos
        ]

    db.add(cosecha)
    await db.commit()
    # Refrescar para asegurar relaciones actualizadas
    await db.refresh(cosecha)

    # Recargar con relaciones si lo necesitas en la respuesta
    result = await db.execute(
        select(Cosecha)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha)
        )
        .where(Cosecha.id == cosecha.id)
    )
    cosecha = result.scalars().first()

    return cosecha


async def get_cosechas_by_predio(db: AsyncSession, predio_id: int) -> List[Cosecha]:
    result = await db.execute(
        select(Cosecha)
        .join(Cosecha.predios)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha)
        )
        .where(Predio.id == predio_id)
    )
    return result.scalars().all()


async def get_cosecha(db: AsyncSession, cosecha_id: int) -> Optional[Cosecha]:
    result = await db.execute(
        select(Cosecha)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha)
        )
        .where(Cosecha.id == cosecha_id)
    )
    return result.scalar_one_or_none()


async def update_cosecha(db: AsyncSession, cosecha: Cosecha, cosecha_in: CosechaUpdate) -> Cosecha:
    # Actualiza campos simples excepto relaciones
    update_data = cosecha_in.dict(exclude_unset=True, exclude={
                                  "predio_ids", "insumos"})
    for field, value in update_data.items():
        setattr(cosecha, field, value)

    # Manejo explícito de predios
    if cosecha_in.predio_ids is not None:
        await db.refresh(cosecha, ["predios"])
        cosecha.predios.clear()

        stmt = select(Predio).where(Predio.id.in_(cosecha_in.predio_ids))
        result = await db.execute(stmt)
        nuevos_predios = result.scalars().all()
        cosecha.predios.extend(nuevos_predios)

    # Manejo explícito de insumos
    if cosecha_in.insumos is not None:
        await db.refresh(cosecha, ["insumos_cosecha"])

        # Borrar insumos anteriores
        for insumo in cosecha.insumos_cosecha:
            await db.delete(insumo)

        # Crear y asociar nuevos insumos
        nuevos_insumos = [
            InsumoCosecha(
                insumo_id=insumo.insumo_id,
                cantidad=insumo.cantidad,
                costo_unitario=insumo.costo_unitario,
                cosecha_id=cosecha.id  # necesario si se crea sin append
            )
            for insumo in cosecha_in.insumos
        ]
        cosecha.insumos_cosecha = nuevos_insumos

    await db.commit()

    # Recargar con relaciones actualizadas
    await db.refresh(cosecha)
    return cosecha


async def delete_cosecha(db: AsyncSession, cosecha: Cosecha) -> None:
    await db.delete(cosecha)
    await db.commit()
