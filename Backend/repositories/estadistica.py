from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.pregunta import Pregunta
from models.respuesta import Respuesta
from datetime import datetime, timedelta
from collections import defaultdict


async def get_estadisticas_opciones(db: AsyncSession):
    hace_30_dias = datetime.utcnow() - timedelta(days=30)

    # Trae preguntas de tipo "opción"
    result = await db.execute(select(Pregunta).where(Pregunta.tipo == "opción"))
    preguntas = result.scalars().all()

    salida = []

    for pregunta in preguntas:
        # Inicializa conteo de todas las opciones posibles en 0
        conteo = {opcion: 0 for opcion in (pregunta.opciones or [])}

        # Trae respuestas de los últimos 30 días asociadas a esta pregunta
        result_resp = await db.execute(
            select(Respuesta.respuesta)
            .where(
                Respuesta.pregunta_id == pregunta.id,
                Respuesta.fecha >= hace_30_dias
            )
        )
        respuestas = result_resp.scalars().all()

        # Contar respuestas por opción
        for r in respuestas:
            if r in conteo:
                conteo[r] += 1

        salida.append({
            "id": pregunta.id,
            "texto": pregunta.texto,
            "conteo_opciones": conteo
        })

    return salida
