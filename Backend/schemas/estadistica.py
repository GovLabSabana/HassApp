from pydantic import BaseModel
from typing import Dict
from datetime import date
from decimal import Decimal


class PreguntaOpcionEstadistica(BaseModel):
    id: int
    texto: str
    conteo_opciones: Dict[str, int]  # opción -> cantidad

    class Config:
        orm_mode = True


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
