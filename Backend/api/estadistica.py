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
