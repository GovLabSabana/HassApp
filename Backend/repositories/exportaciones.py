from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from models.exportacion import Exportacion
from models.exportacion_cosecha import ExportacionCosecha
from models.cosecha import Cosecha
from schemas.exportaciones import ExportacionCreate, ExportacionUpdate, ExportacionOut
from schemas.cosecha import CosechaRead
from sqlalchemy.orm import joinedload

async def get_all(db: AsyncSession):
    result = await db.execute(select(Exportacion).options(
        joinedload(Exportacion.cosechas).joinedload(Cosecha.insumos_cosecha)
    ))
    exportaciones = result.scalars().all()

    for export in exportaciones:
        export.cosechas = [CosechaRead.from_orm_with_predios(c) for c in export.cosechas]

    return exportaciones


async def get_all(db: AsyncSession):
    result = await db.execute(select(Exportacion).options(
        joinedload(Exportacion.cosechas).joinedload(Cosecha.insumos_cosecha)
    ))
    exportaciones = result.scalars().all()

    for export in exportaciones:
        export.cosechas = [CosechaRead.from_orm_with_predios(c) for c in export.cosechas]

    return exportaciones

async def get_by_id(db: AsyncSession, exportacion_id: int):
    result = await db.execute(select(Exportacion).where(Exportacion.id == exportacion_id))
    export = result.scalar_one_or_none()

    if export:
        cosechas_result = await db.execute(
            select(Cosecha).join(ExportacionCosecha).where(
                ExportacionCosecha.exportacion_id == exportacion_id
            )
        )
        cosechas = cosechas_result.scalars().all()
        export.cosechas = [CosechaRead.from_orm_with_predios(c) for c in cosechas]

    return export


async def create(db: AsyncSession, exportacion: ExportacionCreate):
    cosecha_ids = exportacion.cosecha_ids
    data_dict = exportacion.model_dump(exclude={"cosecha_ids"})


    db_export = Exportacion(**data_dict)
    db.add(db_export)
    await db.commit()
    await db.refresh(db_export)

    for cosecha_id in cosecha_ids:
        relacion = ExportacionCosecha(
            exportacion_id=db_export.id,
            cosecha_id=cosecha_id
        )
        db.add(relacion)

    await db.commit()

    return await get_by_id(db, db_export.id)


async def update(db: AsyncSession, exportacion_id: int, exportacion_data: ExportacionUpdate):
    db_export = await get_by_id(db, exportacion_id)
    if db_export:
        for key, value in exportacion_data.model_dump(exclude_unset=True, exclude={"cosecha_ids"}).items():

            setattr(db_export, key, value)

        if exportacion_data.cosecha_ids is not None:
            await db.execute(
                text("DELETE FROM exportacion_cosecha WHERE exportacion_id = :id"),
                {"id": exportacion_id}
            )
            for cosecha_id in exportacion_data.cosecha_ids:
                relacion = ExportacionCosecha(
                    exportacion_id=exportacion_id,
                    cosecha_id=cosecha_id
                )
                db.add(relacion)

        await db.commit()
        await db.refresh(db_export)

    return await get_by_id(db, exportacion_id)


async def delete(db: AsyncSession, exportacion_id: int):
    db_export = await get_by_id(db, exportacion_id)
    if db_export:
        await db.execute(
            text("DELETE FROM exportacion_cosecha WHERE exportacion_id = :id"),
            {"id": exportacion_id}
        )
        await db.delete(db_export)
        await db.commit()
    return db_export
