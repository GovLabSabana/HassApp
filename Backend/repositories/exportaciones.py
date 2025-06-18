# repositories/exportaciones.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from sqlalchemy.orm import joinedload, selectinload

from models.exportacion import Exportacion
from models.exportacion_cosecha import ExportacionCosecha
from models.cosecha import Cosecha
from models.insumo_cosecha import InsumoCosecha
from schemas.exportaciones import ExportacionCreate, ExportacionUpdate
from schemas.cosecha import CosechaRead


from sqlalchemy.orm import selectinload, joinedload

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload

from models.exportacion import Exportacion
from models.exportacion_cosecha import ExportacionCosecha
from models.cosecha import Cosecha
from models.insumo_cosecha import InsumoCosecha
from schemas.cosecha import CosechaRead


async def get_all_raw(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Exportacion)
        .where(Exportacion.usuario_id == user_id)
        .options(
            selectinload(Exportacion.cosechas)
            .joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.predios),
            selectinload(Exportacion.cosechas)
            .joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.insumos_cosecha)
            .joinedload(InsumoCosecha.insumo),
        )
    )
    return result.scalars().all()


async def get_by_id_raw(db: AsyncSession, exportacion_id: int):
    result = await db.execute(
        select(Exportacion)
        .where(Exportacion.id == exportacion_id)
        .options(
            selectinload(Exportacion.cosechas)
            .joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.predios),
            selectinload(Exportacion.cosechas)
            .joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.insumos_cosecha)
            .joinedload(InsumoCosecha.insumo),
        )
    )
    return result.scalar_one_or_none()


async def get_all(db: AsyncSession):
    # 1) Traer solo Exportacion (sin relaciones)
    result = await db.execute(select(Exportacion))
    exportaciones = result.scalars().all()

    # 2) Para cada exportación, cargar sus ExportacionCosecha → Cosecha → predios e insumos
    for exp in exportaciones:
        q = (
            select(ExportacionCosecha)
            .where(ExportacionCosecha.exportacion_id == exp.id)
            .options(
                # Sub‐path A: cargamos la cosecha y sus predios
                joinedload(ExportacionCosecha.cosecha)
                .selectinload(Cosecha.predios),
                # Sub‐path B: cargamos la cosecha y sus insumos (+ insumo)
                joinedload(ExportacionCosecha.cosecha)
                .selectinload(Cosecha.insumos_cosecha)
                .joinedload(InsumoCosecha.insumo),
            )
        )
        rels = (await db.execute(q)).scalars().all()
        cosechas = [rel.cosecha for rel in rels]
        exp.cosechas = [CosechaRead.from_orm_with_predios(c) for c in cosechas]

    return exportaciones


async def get_by_id(db: AsyncSession, exportacion_id: int):
    # 1) Traer la Exportacion
    result = await db.execute(
        select(Exportacion).where(Exportacion.id == exportacion_id)
    )
    export = result.scalar_one_or_none()
    if not export:
        return None

    # 2) Cargar sus relaciones igual que en get_all
    q = (
        select(ExportacionCosecha)
        .where(ExportacionCosecha.exportacion_id == exportacion_id)
        .options(
            joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.predios),
            joinedload(ExportacionCosecha.cosecha)
            .selectinload(Cosecha.insumos_cosecha)
            .joinedload(InsumoCosecha.insumo),
        )
    )
    rels = (await db.execute(q)).scalars().all()
    cosechas = [rel.cosecha for rel in rels]
    export.cosechas = [CosechaRead.from_orm_with_predios(c) for c in cosechas]

    return export


async def create(db: AsyncSession, exportacion_in: ExportacionCreate, user_id: int) -> Exportacion:
    data = exportacion_in.model_dump(exclude={"cosecha_ids"})
    # <- Aquí se asigna el usuario
    db_export = Exportacion(**data, usuario_id=user_id)
    db.add(db_export)
    await db.commit()
    await db.refresh(db_export)

    for cid in exportacion_in.cosecha_ids:
        assoc = ExportacionCosecha(exportacion_id=db_export.id, cosecha_id=cid)
        db.add(assoc)
    await db.commit()

    return db_export


async def update(db: AsyncSession, exportacion_id: int, exportacion_data: ExportacionUpdate) -> Exportacion | None:
    """Actualiza campos y relaciones, devuelve objeto actualizado sin mutar colecciones."""
    # actualizar campos simples
    result = await db.execute(select(Exportacion).where(Exportacion.id == exportacion_id))
    db_export = result.scalar_one_or_none()
    if not db_export:
        return None
    for k, v in exportacion_data.model_dump(exclude_unset=True, exclude={"cosecha_ids"}).items():
        setattr(db_export, k, v)

    if exportacion_data.cosecha_ids is not None:
        # borrar relaciones
        await db.execute(
            text("DELETE FROM exportacion_cosecha WHERE exportacion_id = :id"),
            {"id": exportacion_id}
        )
        # añadir nuevas
        for cid in exportacion_data.cosecha_ids:
            db.add(ExportacionCosecha(
                exportacion_id=exportacion_id, cosecha_id=cid))

    await db.commit()
    return db_export


async def delete(db: AsyncSession, exportacion_id: int) -> Exportacion | None:
    """Elimina la exportación y retorna el objeto eliminado."""
    result = await db.execute(select(Exportacion).where(Exportacion.id == exportacion_id))
    db_export = result.scalar_one_or_none()
    if not db_export:
        return None

    # eliminar associations
    await db.execute(
        text("DELETE FROM exportacion_cosecha WHERE exportacion_id = :id"),
        {"id": exportacion_id}
    )
    # eliminar exportacion
    await db.delete(db_export)
    await db.commit()
    return db_export
