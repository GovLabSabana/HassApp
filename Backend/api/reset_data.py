# api/reset_data.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.db import get_db
from utils.current_user import current_user

router = APIRouter(
    prefix="/fake", tags=["fake-reset"], dependencies=[Depends(current_user)])


@router.post("/reset-db")
async def reset_database(db: AsyncSession = Depends(get_db)):
    # 1) Desactivar checks de claves foráneas
    await db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

    # 2) Lista de tablas en el orden correcto
    tablas = [
        "exportacion_cosecha", "exportacion", "comprador",
        "insumo_cosecha", "insumo", "categoria_insumo", "proveedor",
        "cosecha_predio", "cosecha", "producto", "calidad",
        "predio", "usuario",
        "municipio", "tipo_documento",
    ]

    resultados = {}
    for tabla in tablas:
        res = await db.execute(text(f"DELETE FROM {tabla}"))
        # Algunos drivers no rellenan rowcount; si es None, ponemos 0
        resultados[tabla] = res.rowcount or 0

    # 3) Reactivar checks de claves foráneas
    await db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

    # 4) Confirmar los cambios
    await db.commit()

    return {
        "mensaje": "Reseteo completo",
        "filas_borradas": resultados
    }
