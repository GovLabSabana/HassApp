from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from core.db import get_db
from models.cosecha import Cosecha
from schemas.cosecha import CosechaCreate, CosechaRead, CosechaUpdate
from repositories import cosecha as cosecha_repo

from fastapi_users import FastAPIUsers
from models.usuario import Usuario, get_user_manager
from core.auth import auth_backend

fastapi_users = FastAPIUsers[Usuario, int](get_user_manager, [auth_backend])
current_user = fastapi_users.current_user()

router = APIRouter(
    prefix="/cosechas",
    tags=["cosechas"],
    dependencies=[Depends(current_user)]
)


@router.get("/", response_model=List[CosechaRead])
async def list_my_cosechas(
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    # Suponiendo que quieres filtrar por usuario a través de predios (modifícalo según tu lógica)
    result = await db.execute(
        select(Cosecha)
    )
    cosechas = result.scalars().all()
    return cosechas


@router.get("/{cosecha_id}", response_model=CosechaRead)
async def get_cosecha_by_id(
    cosecha_id: int,
    db: AsyncSession = Depends(get_db)
):
    cosecha = await cosecha_repo.get_cosecha(db, cosecha_id)
    if not cosecha:
        raise HTTPException(status_code=404, detail="Cosecha no encontrada")
    return CosechaRead.from_orm_with_predios(cosecha)


@router.get("/por-predio/{predio_id}", response_model=List[CosechaRead])
async def get_cosechas_by_predio_id(
    predio_id: int,
    db: AsyncSession = Depends(get_db)
):
    cosechas = await cosecha_repo.get_cosechas_by_predio(db, predio_id)
    return [CosechaRead.from_orm_with_predios(c) for c in cosechas]


@router.post("/", response_model=CosechaRead)
async def create_cosecha(
    cosecha_in: CosechaCreate,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    # Puedes agregar validaciones aquí si es necesario
    cosecha = await cosecha_repo.create_cosecha(db, cosecha_in)
    # Devuelve el esquema Pydantic con predio_ids llenos
    return CosechaRead.from_orm_with_predios(cosecha)


@router.put("/{cosecha_id}", response_model=CosechaRead)
async def update_cosecha(
    cosecha_id: int,
    cosecha_in: CosechaUpdate,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    cosecha = await cosecha_repo.get_cosecha(db, cosecha_id)
    if cosecha is None:
        raise HTTPException(status_code=404, detail="Cosecha no encontrada")
    # Opcional: validar que el usuario pueda modificar esta cosecha (ej. propiedad predios)
    cosecha = await cosecha_repo.update_cosecha(db, cosecha, cosecha_in)
    return CosechaRead.from_orm_with_predios(cosecha)


@router.delete("/{cosecha_id}", status_code=204)
async def delete_cosecha(
    cosecha_id: int,
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user)
):
    cosecha = await cosecha_repo.get_cosecha(db, cosecha_id)
    if cosecha is None:
        raise HTTPException(status_code=404, detail="Cosecha no encontrada")
    # Opcional: validar propiedad usuario aquí
    await cosecha_repo.delete_cosecha(db, cosecha)
