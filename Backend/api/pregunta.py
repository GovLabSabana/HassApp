from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.pregunta import Pregunta
from schemas.pregunta import PreguntaOut
from utils.current_user import current_user

router = APIRouter(
    prefix="/preguntas",
    tags=["preguntas"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=list[PreguntaOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pregunta))
    return result.scalars().all()


@router.get("/{pregunta_id}", response_model=PreguntaOut)
async def get_one(pregunta_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pregunta).where(Pregunta.id == pregunta_id))
    pregunta = result.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return pregunta
