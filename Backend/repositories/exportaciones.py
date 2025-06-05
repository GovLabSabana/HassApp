from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from models.exportacion import Exportacion
from models.exportacion_cosecha import ExportacionCosecha
from schemas.exportaciones import ExportacionCreate, ExportacionUpdate


async def get_all(db: AsyncSession):
    result = await db.execute(select(Exportacion))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, exportacion_id: int):
    result = await db.execute(select(Exportacion).where(Exportacion.id == exportacion_id))
    export = result.scalar_one_or_none()

    if export:
        cosechas_result = await db.execute(
            select(ExportacionCosecha.cosecha_id).where(
                ExportacionCosecha.exportacion_id == exportacion_id
            )
        )
        cosecha_ids = [row[0] for row in cosechas_result.all()]
        export.cosecha_ids = cosecha_ids  

    return export


async def create(db: AsyncSession, exportacion: ExportacionCreate):
    # Se separan los ids de cosecha del resto de los datos
    cosecha_ids = exportacion.cosecha_ids
    data_dict = exportacion.dict(exclude={"cosecha_ids"})

    # Se crea la exportación
    db_export = Exportacion(**data_dict)
    db.add(db_export)
    await db.commit()
    await db.refresh(db_export)

    # Se crean las relaciones con cosechas
    for cosecha_id in cosecha_ids:
        relacion = ExportacionCosecha(
            exportacion_id=db_export.id,
            cosecha_id=cosecha_id
        )
        db.add(relacion)
    await db.commit()

    return db_export


async def update(db: AsyncSession, exportacion_id: int, exportacion_data: ExportacionUpdate):
    db_export = await get_by_id(db, exportacion_id)
    if db_export:
        for key, value in exportacion_data.dict(exclude_unset=True, exclude={"cosecha_ids"}).items():
            setattr(db_export, key, value)

        if exportacion_data.cosecha_ids is not None:
            # ✅ CORREGIDO: Borrar relaciones previas con text() y parámetros seguros
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
    return db_export


async def delete(db: AsyncSession, exportacion_id: int):
    db_export = await get_by_id(db, exportacion_id)
    if db_export:
        # ✅ CORREGIDO: Borrar relaciones intermedias con text() y parámetros
        await db.execute(
            text("DELETE FROM exportacion_cosecha WHERE exportacion_id = :id"),
            {"id": exportacion_id}
        )
        await db.delete(db_export)
        await db.commit()
    return db_export