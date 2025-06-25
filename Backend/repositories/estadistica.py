from datetime import datetime
from schemas.estadistica import ProduccionPorPredio
from models.rompimientos import cosecha_predio_table
from models.predio import Predio
from sqlalchemy import func, select
from schemas.estadistica import ToneladasCosechadasMensual
from schemas.estadistica import CostoCategoriaPorTonelada
from collections import defaultdict
from sqlalchemy.orm import selectinload
from schemas.estadistica import ValorInsumosPorCategoria
from models.categoria_insumo import CategoriaInsumo
from models.insumo import Insumo
from sqlalchemy import select, func
from models.insumo_cosecha import InsumoCosecha
from schemas.estadistica import ExportacionMensual
from models.exportacion import Exportacion
from sqlalchemy import extract, func
from decimal import Decimal
from schemas.estadistica import RendimientoCosecha
from models.cosecha import Cosecha
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.pregunta import Pregunta
from models.respuesta import Respuesta
from datetime import datetime, timedelta


async def get_estadisticas_opciones(db: AsyncSession):
    hace_30_dias = datetime.utcnow() - timedelta(days=30)

    result = await db.execute(select(Pregunta).where(Pregunta.tipo == "opción"))
    preguntas = result.scalars().all()

    salida = []

    for pregunta in preguntas:

        conteo = {opcion: 0 for opcion in (pregunta.opciones or [])}

        result_resp = await db.execute(
            select(Respuesta.respuesta)
            .where(
                Respuesta.pregunta_id == pregunta.id,
                Respuesta.fecha >= hace_30_dias
            )
        )
        respuestas = result_resp.scalars().all()

        for r in respuestas:
            if r in conteo:
                conteo[r] += 1

        salida.append({
            "id": pregunta.id,
            "texto": pregunta.texto,
            "conteo_opciones": conteo
        })

    return salida


async def get_rendimiento_por_hectarea(db: AsyncSession) -> list[RendimientoCosecha]:
    stmt = select(Cosecha).options(joinedload(Cosecha.producto))
    result = await db.execute(stmt)
    cosechas = result.scalars().all()

    respuesta = []
    for c in cosechas:
        if c.toneladas and c.hectareas and c.hectareas > 0:
            rendimiento = c.toneladas / c.hectareas
            respuesta.append(RendimientoCosecha(
                cosecha_id=c.id,
                producto=c.producto.nombre,
                fecha=c.fecha,
                toneladas=c.toneladas,
                hectareas=c.hectareas,
                rendimiento=rendimiento
            ))
    return respuesta


async def get_rendimiento_total(db: AsyncSession) -> Decimal:
    stmt = select(Cosecha)
    result = await db.execute(stmt)
    cosechas = result.scalars().all()

    total_toneladas = Decimal(0)
    total_hectareas = Decimal(0)

    for c in cosechas:
        if c.toneladas and c.hectareas and c.hectareas > 0:
            total_toneladas += c.toneladas
            total_hectareas += c.hectareas

    if total_hectareas == 0:
        return Decimal(0)

    return total_toneladas / total_hectareas


async def get_exportaciones_por_mes(db: AsyncSession) -> list[ExportacionMensual]:
    stmt = (
        select(
            func.date_format(Exportacion.fecha, "%Y-%m").label("mes"),
            func.sum(Exportacion.valor_fob).label("valor_fob"),
            func.sum(Exportacion.toneladas).label("toneladas")
        )
        .group_by("mes")
        .order_by("mes")
    )

    result = await db.execute(stmt)
    rows = result.fetchall()

    return [
        ExportacionMensual(
            mes=row.mes,
            valor_fob=row.valor_fob or 0,
            toneladas=row.toneladas or 0
        )
        for row in rows
    ]


async def get_valor_insumos_por_categoria(db: AsyncSession) -> list[ValorInsumosPorCategoria]:
    stmt = (
        select(
            CategoriaInsumo.nombre.label("categoria"),
            func.sum(InsumoCosecha.cantidad *
                     Insumo.costo_unitario).label("valor_total")
        )
        .join(Insumo, Insumo.id == InsumoCosecha.insumo_id)
        .join(CategoriaInsumo, CategoriaInsumo.id == Insumo.categoria_id)
        .group_by(CategoriaInsumo.nombre)
        .order_by(CategoriaInsumo.nombre)
    )

    result = await db.execute(stmt)
    rows = result.fetchall()

    return [
        ValorInsumosPorCategoria(
            categoria=row.categoria, valor_total=row.valor_total or 0)
        for row in rows
    ]


async def get_costo_categoria_por_tonelada(db: AsyncSession) -> list[CostoCategoriaPorTonelada]:
    stmt = select(Cosecha).options(
        selectinload(Cosecha.insumos_cosecha).selectinload(
            InsumoCosecha.insumo).selectinload(Insumo.categoria)
    )
    result = await db.execute(stmt)
    cosechas = result.scalars().all()

    categorias = defaultdict(
        lambda: {"valor_total": Decimal(0), "toneladas": Decimal(0)})

    for cosecha in cosechas:
        if cosecha.toneladas and cosecha.toneladas > 0 and cosecha.insumos_cosecha:
            for insumo_cosecha in cosecha.insumos_cosecha:
                insumo = insumo_cosecha.insumo
                categoria = insumo.categoria.nombre
                valor = insumo_cosecha.cantidad * insumo.costo_unitario

                categorias[categoria]["valor_total"] += valor
                categorias[categoria]["toneladas"] += cosecha.toneladas

    resultado = []
    for categoria, datos in categorias.items():
        toneladas = datos["toneladas"]
        promedio = datos["valor_total"] / \
            toneladas if toneladas > 0 else Decimal(0)
        resultado.append(CostoCategoriaPorTonelada(
            categoria=categoria,
            valor_total=datos["valor_total"],
            total_toneladas=toneladas,
            promedio_por_tonelada=promedio
        ))

    return resultado


async def get_toneladas_cosecha_por_mes(db: AsyncSession) -> list[ToneladasCosechadasMensual]:
    stmt = (
        select(
            func.date_format(Cosecha.fecha, "%Y-%m").label("mes"),
            func.sum(Cosecha.toneladas).label("toneladas")
        )
        .group_by("mes")
        .order_by("mes")
    )

    result = await db.execute(stmt)
    rows = result.fetchall()

    return [
        ToneladasCosechadasMensual(
            mes=row.mes,
            toneladas=row.toneladas or 0
        )
        for row in rows
    ]


async def get_produccion_predio_ultimo_mes(db: AsyncSession) -> list[ProduccionPorPredio]:

    max_date_stmt = select(func.max(Cosecha.fecha))
    max_date_result = await db.execute(max_date_stmt)
    max_date = max_date_result.scalar_one_or_none()

    if not max_date:
        return []

    año = max_date.year
    mes = max_date.month

    stmt = (
        select(
            Predio.nombre.label("predio"),
            func.sum(Cosecha.hectareas).label("hectareas"),
            func.sum(Cosecha.toneladas).label("toneladas")
        )
        .select_from(cosecha_predio_table)
        .join(Predio, cosecha_predio_table.c.predio_id == Predio.id)
        .join(Cosecha, cosecha_predio_table.c.cosecha_id == Cosecha.id)
        .where(func.year(Cosecha.fecha) == año)
        .where(func.month(Cosecha.fecha) == mes)
        .group_by(Predio.nombre)
    )

    result = await db.execute(stmt)
    rows = result.fetchall()

    return [
        ProduccionPorPredio(
            predio=row.predio,
            hectareas=row.hectareas or 0,
            toneladas=row.toneladas or 0
        )
        for row in rows
    ]
