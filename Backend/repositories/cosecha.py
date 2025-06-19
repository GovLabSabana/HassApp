from models.insumo import Insumo
from sqlalchemy import select
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
from fastapi import HTTPException


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

    # Asociar insumos (desde insumo_id y cantidad)
    if cosecha_in.insumos:
        # Obtener los insumos para poder acceder a su costo_unitario
        insumo_ids = [item.insumo_id for item in cosecha_in.insumos]
        result = await db.execute(
            select(Insumo).where(Insumo.id.in_(insumo_ids))
        )
        insumos = {insumo.id: insumo for insumo in result.scalars().all()}

        insumos_cosecha = []
        for item in cosecha_in.insumos:
            insumo = insumos.get(item.insumo_id)
            if not insumo:
                raise HTTPException(
                    status_code=404, detail=f"Insumo {item.insumo_id} no encontrado")

            insumo_cosecha = InsumoCosecha(
                insumo_id=item.insumo_id,
                cantidad=item.cantidad,
                insumo=insumo  # relaciona con el insumo que sí tiene el costo
            )
            insumos_cosecha.append(insumo_cosecha)

        cosecha.insumos_cosecha = insumos_cosecha

    db.add(cosecha)
    await db.commit()
    await db.refresh(cosecha)

    # Recargar con relaciones si lo necesitas en la respuesta
    result = await db.execute(
        select(Cosecha)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha).selectinload(
                InsumoCosecha.insumo)
        )
        .where(Cosecha.id == cosecha.id)
    )
    return result.scalars().first()


async def get_cosechas_by_predio(db: AsyncSession, predio_id: int) -> List[Cosecha]:
    result = await db.execute(
        select(Cosecha)
        .join(Cosecha.predios)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha).selectinload(
                InsumoCosecha.insumo)
        )
        .where(Predio.id == predio_id)
    )
    return result.scalars().all()


async def get_cosecha(db: AsyncSession, cosecha_id: int) -> Optional[Cosecha]:
    result = await db.execute(
        select(Cosecha)
        .options(
            selectinload(Cosecha.predios),
            selectinload(Cosecha.insumos_cosecha).selectinload(
                InsumoCosecha.insumo)
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

        # Eliminar insumos anteriores
        for insumo in cosecha.insumos_cosecha:
            await db.delete(insumo)
        await db.flush()  # aplicar deletes antes de agregar

        # Obtener los insumos originales para conocer el costo_unitario
        insumo_ids = [item.insumo_id for item in cosecha_in.insumos]
        result = await db.execute(select(Insumo).where(Insumo.id.in_(insumo_ids)))
        insumos_db = {insumo.id: insumo for insumo in result.scalars().all()}

        nuevos_insumos = []
        for item in cosecha_in.insumos:
            insumo_db = insumos_db.get(item.insumo_id)
            if not insumo_db:
                raise HTTPException(
                    status_code=404, detail=f"Insumo {item.insumo_id} no encontrado")
            nuevos_insumos.append(
                InsumoCosecha(
                    insumo_id=item.insumo_id,
                    cantidad=item.cantidad,
                    insumo=insumo_db,
                    cosecha_id=cosecha.id
                )
            )

        cosecha.insumos_cosecha = nuevos_insumos

    await db.commit()

    return await get_cosecha(db, cosecha.id)


async def delete_cosecha(db: AsyncSession, cosecha: Cosecha) -> None:
    await db.delete(cosecha)
    await db.commit()
