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
async def rendimiento_por_hectarea(db: AsyncSession = Depends(get_db)):
    return await repo.get_rendimiento_por_hectarea(db)

# Es el rendimiento total de todas las cosechas en toneladas por hectárea


@router.get("/rendimiento/total", response_model=RendimientoTotal)
async def rendimiento_total(db: AsyncSession = Depends(get_db)):
    rendimiento = await repo.get_rendimiento_total(db)
    return {"rendimiento_total": rendimiento}


#  Valor FOB y toneladas exportadas por mes

@router.get("/exportaciones/linea-tiempo", response_model=List[ExportacionMensual])
async def exportaciones_linea_tiempo(db: AsyncSession = Depends(get_db)):
    return await repo.get_exportaciones_por_mes(db)

# Valor de insumos usados por categoría


@router.get("/insumos/valor-por-categoria", response_model=List[ValorInsumosPorCategoria])
async def valor_insumos_por_categoria(db: AsyncSession = Depends(get_db)):
    return await repo.get_valor_insumos_por_categoria(db)


# Costo de insumos por categoría por tonelada
@router.get("/insumos/promedio-por-tonelada-categoria", response_model=List[CostoCategoriaPorTonelada])
async def promedio_categoria_por_tonelada(db: AsyncSession = Depends(get_db)):
    return await repo.get_costo_categoria_por_tonelada(db)
