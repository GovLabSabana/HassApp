# api/predio.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_db
from models.predio import Predio
from models.user import User
from schemas.predio import PredioCreate, PredioRead, PredioUpdate
from models.user import get_user_manager
from core.auth import auth_backend
from fastapi_users import FastAPIUsers

router = APIRouter(prefix="/predios", tags=["predios"])

fastapi_users = FastAPIUsers[User, int](get_user_manager, [auth_backend])
current_user = fastapi_users.current_user()

# Obtener todos los predios del usuario autenticado


@router.get("/", response_model=list[PredioRead])
async def list_my_predios(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Predio).where(Predio.usuario_id == user.id)
    )
    predios = result.scalars().all()
    return predios


# Añadir un nuevo predio para el usuario autenticado
@router.post("/", response_model=PredioRead)
async def create_predio(
    predio_data: PredioCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    predio = Predio(**predio_data.dict(), usuario_id=user.id)
    db.add(predio)
    await db.commit()
    await db.refresh(predio)
    return predio


# Actualizar un predio del usuario autenticado
@router.put("/{predio_id}", response_model=PredioRead)
async def update_predio(
    predio_id: int,
    predio_update: PredioUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Predio).where(Predio.id == predio_id,
                             Predio.usuario_id == user.id)
    )
    predio = result.scalar_one_or_none()

    if predio is None:
        raise HTTPException(status_code=404, detail="Predio no encontrado")

    for field, value in predio_update.dict(exclude_unset=True).items():
        setattr(predio, field, value)

    await db.commit()
    await db.refresh(predio)
    return predio
