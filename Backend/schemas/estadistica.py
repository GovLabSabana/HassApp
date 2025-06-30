from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, ConfigDict
from typing import Dict
from datetime import date
from decimal import Decimal


class PreguntaOpcionEstadistica(BaseModel):
    id: int
    texto: str
    conteo_opciones: Dict[str, int]  # opción -> cantidad

    model_config = ConfigDict(from_attributes=True)


class RendimientoCosecha(BaseModel):
    cosecha_id: int
    producto: str
    fecha: date
    toneladas: Decimal
    hectareas: Decimal
    rendimiento: Decimal


class RendimientoTotal(BaseModel):
    rendimiento_total: Decimal


class ExportacionMensual(BaseModel):
    mes: str  # Ej: "2025-01"
    valor_fob: Decimal
    toneladas: Decimal


class ValorInsumosPorCategoria(BaseModel):
    categoria: str
    valor_total: Decimal


class CostoCategoriaPorTonelada(BaseModel):
    categoria: str
    valor_total: Decimal
    total_toneladas: Decimal
    promedio_por_tonelada: Decimal


class ToneladasCosechadasMensual(BaseModel):
    mes: str  # Ejemplo: "2025-06"
    toneladas: Decimal


class ProduccionPorPredio(BaseModel):
    predio: str
    hectareas: Decimal
    toneladas: Decimal


class ProduccionEstimacionComparada(BaseModel):
    mes: str  # "2025-08"
    estimada: int
    real: int


class EstadoRespuestasMensual(BaseModel):
    produccion_estimada: bool
    produccion_real: bool


class ProduccionTotalYMejora(BaseModel):
    produccion_total: int
    produccion_mes_actual: int
    produccion_mes_anterior: int
    porcentaje_mejora: Optional[float]


class TotalHectareasUsuario(BaseModel):
    hectareas: float


class ProduccionPorProducto(BaseModel):
    producto_id: int
    producto_nombre: str
    toneladas: float
    valor_fob: float
