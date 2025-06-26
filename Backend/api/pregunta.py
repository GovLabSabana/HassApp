from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.pregunta import Pregunta
from schemas.pregunta import PreguntaOut
from utils.current_user import current_user
from schemas.pregunta import PreguntaOutConRespuesta
from models.respuesta import Respuesta

router = APIRouter(
    prefix="/preguntas",
    tags=["preguntas"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=list[PreguntaOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pregunta))
    return result.scalars().all()


@router.get("/con-respuesta", response_model=list[PreguntaOutConRespuesta])
async def get_preguntas_con_estado(db: AsyncSession = Depends(get_db), user=Depends(current_user)):
    result = await db.execute(select(Pregunta))
    preguntas = result.scalars().all()

    respuestas_result = await db.execute(
        select(Respuesta.pregunta_id).where(Respuesta.usuario_id == user.id)
    )
    preguntas_respondidas = {row[0] for row in respuestas_result.fetchall()}

    return [
        PreguntaOutConRespuesta(
            id=p.id,
            texto=p.texto,
            clave=p.clave,
            tipo=p.tipo,
            opciones=p.opciones,
            respondida=p.id in preguntas_respondidas
        )
        for p in preguntas
    ]


@router.get("/{pregunta_id}", response_model=PreguntaOut)
async def get_one(pregunta_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pregunta).where(Pregunta.id == pregunta_id))
    pregunta = result.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return pregunta
