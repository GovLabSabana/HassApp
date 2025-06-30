from schemas.estadistica import ProduccionPorProducto
from sqlalchemy import select, func, outerjoin
from models.exportacion_cosecha import ExportacionCosecha
from models.producto import Producto
from schemas.estadistica import TotalHectareasUsuario
from schemas.estadistica import ProduccionEstimacionComparada
from schemas.estadistica import ProduccionTotalYMejora
from sqlalchemy import select, extract, func
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
from sqlalchemy import Integer
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


async def get_produccion_estimacion_comparada(db: AsyncSession) -> list[ProduccionEstimacionComparada]:
    # IDs de preguntas según definición
    ID_ESTIMADA = 10
    ID_REAL = 11

    # Obtener todas las respuestas relevantes
    stmt = select(Respuesta).where(
        Respuesta.pregunta_id.in_([ID_ESTIMADA, ID_REAL]))
    result = await db.execute(stmt)
    respuestas = result.scalars().all()

    datos = defaultdict(lambda: {"estimada": 0, "real": 0})

    for r in respuestas:
        try:
            valor = int(float(r.respuesta.strip()))
        except ValueError:
            continue  # Saltar si no es número

        fecha = r.fecha

        if r.pregunta_id == ID_ESTIMADA:
            # Asignar al mes SIGUIENTE
            mes = (fecha.replace(day=1) + timedelta(days=32)).replace(day=1)
        elif r.pregunta_id == ID_REAL:
            # Asignar al mes ANTERIOR
            mes = (fecha.replace(day=1) - timedelta(days=1)).replace(day=1)
        else:
            continue

        clave_mes = mes.strftime("%Y-%m")
        if r.pregunta_id == ID_ESTIMADA:
            datos[clave_mes]["estimada"] += valor
        else:
            datos[clave_mes]["real"] += valor

    # Ordenar y construir respuesta
    resultado = [
        ProduccionEstimacionComparada(
            mes=mes,
            estimada=val["estimada"],
            real=val["real"]
        )
        for mes, val in sorted(datos.items())
    ]

    return resultado


async def get_produccion_total_y_mejora(db: AsyncSession, user_id: int) -> ProduccionTotalYMejora:
    ID_REAL = 11

    hoy = datetime.utcnow()
    mes_actual = hoy.month
    anio_actual = hoy.year

    mes_anterior_date = (hoy.replace(day=1) - timedelta(days=1))
    mes_anterior = mes_anterior_date.month
    anio_anterior = mes_anterior_date.year

    # Producción total histórica de cosechas del usuario
    stmt_total = (
        select(func.sum(Cosecha.toneladas))
        .join(Cosecha.predios)  # unir predios
        .where(Cosecha.toneladas != None)
        .where(Cosecha.predios.any(Predio.usuario_id == user_id))
    )
    res_total = await db.execute(stmt_total)
    total_cosechas = res_total.scalar() or 0

    # Producción del mes actual en cosechas
    stmt_mes_actual = (
        select(func.sum(Cosecha.toneladas))
        .join(Cosecha.predios)
        .where(Cosecha.toneladas != None)
        .where(Cosecha.predios.any(Predio.usuario_id == user_id))
        .where(extract("month", Cosecha.fecha) == mes_actual)
        .where(extract("year", Cosecha.fecha) == anio_actual)
    )
    res_actual = await db.execute(stmt_mes_actual)
    produccion_mes_actual = res_actual.scalar() or 0

    # Producción reportada del mes anterior (respuestas)
    stmt_mes_anterior = (
        select(func.sum(func.cast(Respuesta.respuesta, Integer)))
        .where(Respuesta.usuario_id == user_id)
        .where(Respuesta.pregunta_id == ID_REAL)
        .where(extract("month", Respuesta.fecha) == mes_anterior)
        .where(extract("year", Respuesta.fecha) == anio_anterior)
    )
    res_anterior = await db.execute(stmt_mes_anterior)

    produccion_mes_anterior = res_anterior.scalar() or 0
    print("Hola", produccion_mes_anterior)
    if produccion_mes_anterior > 0:
        porcentaje_mejora = (
            (produccion_mes_actual - produccion_mes_anterior) / produccion_mes_anterior) * 100
    else:
        porcentaje_mejora = None

    return ProduccionTotalYMejora(
        produccion_total=int(total_cosechas),
        produccion_mes_actual=int(produccion_mes_actual),
        produccion_mes_anterior=int(produccion_mes_anterior),
        porcentaje_mejora=porcentaje_mejora
    )


async def get_total_hectareas_usuario(db: AsyncSession, user_id: int) -> TotalHectareasUsuario:
    stmt = select(func.sum(Predio.hectareas)).where(
        Predio.usuario_id == user_id
    )
    res = await db.execute(stmt)
    total = res.scalar() or 0

    return TotalHectareasUsuario(hectareas=float(total))


async def get_produccion_por_producto(db: AsyncSession, user_id: int) -> list[ProduccionPorProducto]:
    # Subconsulta: todas las cosechas que pertenecen al usuario
    subq = (
        select(cosecha_predio_table.c.cosecha_id)
        .join(Predio, cosecha_predio_table.c.predio_id == Predio.id)
        .where(Predio.usuario_id == user_id)
        .distinct()
    )

    # Construir join con Producto y Exportacion
    cosecha_alias = Cosecha.__table__.alias("c")
    producto_alias = Producto.__table__.alias("p")
    exportacion_cosecha_alias = ExportacionCosecha.__table__.alias("ec")
    exportacion_alias = Exportacion.__table__.alias("e")

    stmt = (
        select(
            producto_alias.c.id,
            producto_alias.c.nombre,
            func.sum(cosecha_alias.c.toneladas).label("toneladas"),
            func.sum(exportacion_alias.c.valor_fob).label("valor_fob")
        )
        .select_from(
            cosecha_alias
            .join(producto_alias, cosecha_alias.c.producto_id == producto_alias.c.id)
            .outerjoin(exportacion_cosecha_alias, exportacion_cosecha_alias.c.cosecha_id == cosecha_alias.c.id)
            .outerjoin(exportacion_alias, exportacion_alias.c.id == exportacion_cosecha_alias.c.exportacion_id)
        )
        .where(cosecha_alias.c.id.in_(subq))
        .group_by(producto_alias.c.id, producto_alias.c.nombre)
        .order_by(producto_alias.c.nombre)
    )

    result = await db.execute(stmt)
    rows = result.fetchall()

    return [
        ProduccionPorProducto(
            producto_id=row[0],
            producto_nombre=row[1],
            toneladas=float(row[2] or 0),
            valor_fob=float(row[3] or 0)
        )
        for row in rows
    ]
