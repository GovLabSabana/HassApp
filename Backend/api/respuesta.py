from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from schemas.respuesta import RespuestaCreate, RespuestaOut
from repositories import respuesta as repo
from utils.current_user import current_user

router = APIRouter(
    prefix="/respuestas",
    tags=["respuestas"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=list[RespuestaOut])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)


@router.get("/{respuesta_id}", response_model=RespuestaOut)
async def get_one(respuesta_id: int, db: AsyncSession = Depends(get_db)):
    respuesta = await repo.get_by_id(db, respuesta_id)
    if not respuesta:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    return respuesta


@router.post("/", response_model=RespuestaOut)
async def create(respuesta: RespuestaCreate, db: AsyncSession = Depends(get_db)):
    return await repo.create(db, respuesta)


@router.delete("/{respuesta_id}")
async def delete(respuesta_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await repo.delete(db, respuesta_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    return {"detail": "Respuesta eliminada"}
