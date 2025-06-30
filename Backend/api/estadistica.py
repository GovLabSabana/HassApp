from schemas.estadistica import ProduccionPorProducto
from schemas.estadistica import ProduccionTotalYMejora
from schemas.estadistica import TotalHectareasUsuario
from schemas.estadistica import ProduccionEstimacionComparada
from schemas.estadistica import ProduccionPorPredio
from schemas.estadistica import ToneladasCosechadasMensual
from schemas.estadistica import CostoCategoriaPorTonelada
from schemas.estadistica import ValorInsumosPorCategoria
from schemas.estadistica import ExportacionMensual
from schemas.estadistica import RendimientoTotal
from schemas.estadistica import RendimientoCosecha
from fastapi import APIRouter, Depends
from utils.current_user import current_user
from typing import List
import repositories.estadistica as repo
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from schemas.estadistica import PreguntaOpcionEstadistica

router = APIRouter(prefix="/estadisticas",
                   tags=["Estadisticas"], dependencies=[Depends(current_user)])


@router.get("/sondeo/opciones", response_model=List[PreguntaOpcionEstadistica])
async def estadisticas_preguntas_opcion(db: AsyncSession = Depends(get_db)):
    return await repo.get_estadisticas_opciones(db)


# Es el rendimiento por tonelada por hectárea en cada cosecha

@router.get("/rendimiento-cosecha", response_model=List[RendimientoCosecha])
async def rendimiento_por_hectarea(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_rendimiento_por_hectarea(db, user.id)

# Es el rendimiento total de todas las cosechas en toneladas por hectárea


@router.get("/rendimiento/total", response_model=RendimientoTotal)
async def rendimiento_total(db: AsyncSession = Depends(get_db)):
    rendimiento = await repo.get_rendimiento_total(db)
    return {"rendimiento_total": rendimiento}


#  Valor FOB y toneladas exportadas por mes

@router.get("/exportaciones/linea-tiempo", response_model=List[ExportacionMensual])
async def exportaciones_linea_tiempo(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_exportaciones_por_mes(db, user.id)

# Valor de insumos usados por categoría


@router.get("/insumos/valor-por-categoria", response_model=List[ValorInsumosPorCategoria])
async def valor_insumos_por_categoria(db: AsyncSession = Depends(get_db)):
    return await repo.get_valor_insumos_por_categoria(db)


# Costo de insumos por categoría por tonelada
@router.get("/insumos/promedio-por-tonelada-categoria", response_model=List[CostoCategoriaPorTonelada])
async def promedio_categoria_por_tonelada(db: AsyncSession = Depends(get_db)):
    return await repo.get_costo_categoria_por_tonelada(db)

# Cantidad de toneladas cosechadas por mes


@router.get("/cosechas/linea-tiempo-toneladas", response_model=List[ToneladasCosechadasMensual])
async def cosechas_linea_tiempo_toneladas(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_toneladas_cosecha_por_mes(db, user.id)

# Producción por predio del último mes hectareadas y toneladas cosechadas


@router.get("/cosechas/ultimo-mes-por-predio", response_model=List[ProduccionPorPredio])
async def cosecha_predio_ultimo_mes(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_produccion_predio_ultimo_mes(db, user.id)

# Comparación de producción estimada vs real por mes debido a sondeo GENERAL, es decir para todos


@router.get("/sondeo/estimacion-vs-real", response_model=List[ProduccionEstimacionComparada])
async def produccion_estimacion_vs_real(db: AsyncSession = Depends(get_db)):
    return await repo.get_produccion_estimacion_comparada(db)

# Total de hectáreas de todos los predios del usuario autenticado


@router.get("/predios/total-hectareas", response_model=TotalHectareasUsuario)
async def total_hectareas_usuario(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_total_hectareas_usuario(db, user.id)

# Producción total y mejora del último mes comparado con el anterior para el usuario autenticado


@router.get("/produccion/total-y-mejora", response_model=ProduccionTotalYMejora)
async def produccion_total_y_mejora(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_produccion_total_y_mejora(db, user.id)

# Producción por producto del usuario autenticado


@router.get("/produccion/por-producto", response_model=list[ProduccionPorProducto])
async def produccion_por_producto(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    return await repo.get_produccion_por_producto(db, user.id)
