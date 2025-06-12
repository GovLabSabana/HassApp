# api/routers/insumos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models.insumo_cosecha import InsumoCosecha
from models.insumo import Insumo
from sqlalchemy import select
from sqlalchemy.orm import selectinload



from core.db import get_db
from schemas.insumo import InsumoCreate, InsumoRead
from schemas.insumo_cosecha import InsumoCosechaCreate, InsumoCosechaRead


# importa tus repos
from repositories.insumo import (
    get_insumo, list_insumos, create_insumo,
    update_insumo, delete_insumo
)
from repositories.insumo_cosecha import (
    add_insumo_to_cosecha, list_insumos_por_cosecha,
    get_insumo_cosecha, delete_insumo_cosecha
)

router = APIRouter(prefix="/insumos", tags=["insumos"])


@router.post("/", response_model=InsumoRead, status_code=status.HTTP_201_CREATED)
async def _create_insumo(
    insumo_in: InsumoCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await create_insumo(db, insumo_in)
    except IntegrityError:
        raise HTTPException(400, "Categoría o proveedor no existen.")


@router.get("/", response_model=list[InsumoRead])
async def _list_insumos(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    return await list_insumos(db, skip, limit)


@router.get("/{insumo_id}", response_model=InsumoRead)
async def _get_insumo(
    insumo_id: int, db: AsyncSession = Depends(get_db),
):
    obj = await get_insumo(db, insumo_id)
    if not obj:
        raise HTTPException(404, "Insumo no encontrado")
    return obj


@router.put("/{insumo_id}", response_model=InsumoRead)
async def _update_insumo(
    insumo_id: int,
    insumo_in: InsumoCreate,
    db: AsyncSession = Depends(get_db),
):
    obj = await get_insumo(db, insumo_id)
    if not obj:
        raise HTTPException(404, "Insumo no encontrado")
    return await update_insumo(db, obj, insumo_in)


@router.delete("/{insumo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def _delete_insumo(
    insumo_id: int, db: AsyncSession = Depends(get_db),
):
    obj = await get_insumo(db, insumo_id)
    if not obj:
        raise HTTPException(404, "Insumo no encontrado")
    await delete_insumo(db, obj)


# ——— Relación insumo–cosecha ———

@router.post(
    "/{insumo_id}/cosechas",
    response_model=InsumoCosechaRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_insumo_to_cosecha(
    insumo_id: int,
    ic_in: InsumoCosechaCreate,
    db: AsyncSession = Depends(get_db),
):
    nueva = InsumoCosecha(
        insumo_id=insumo_id,
        cosecha_id=ic_in.cosecha_id,
        cantidad=ic_in.cantidad,
    )
    db.add(nueva)
    try:
        await db.commit()
        # Traemos la relación INSUMO _dentro_ de la sesión para evitar lazy-load fuera  
        await db.refresh(nueva, attribute_names=["insumo"])
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Insumo o cosecha no existen.")

    # Devolvemos un dict con todos los campos, incluidos los de la relación
    return {
        "id": nueva.id,
        "insumo_id": nueva.insumo_id,
        "cosecha_id": nueva.cosecha_id,
        "cantidad": nueva.cantidad,
        "nombre_comercial": nueva.insumo.nombre_comercial,
        "costo_unitario": nueva.insumo.costo_unitario,
    }

# api/routers/insumos.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from core.db import get_db
from schemas.insumo_cosecha import InsumoCosechaRead
from models.insumo_cosecha import InsumoCosecha

router = APIRouter(prefix="/insumos", tags=["insumos"])

@router.get(
    "/cosechas/{cosecha_id}",
    response_model=list[InsumoCosechaRead]
)
async def list_insumos_por_cosecha(
    cosecha_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InsumoCosecha)
        .options(selectinload(InsumoCosecha.insumo))
        .where(InsumoCosecha.cosecha_id == cosecha_id)
    )
    relaciones = result.scalars().all()

    salida = [
        {
            "id": ic.id,
            "insumo_id": ic.insumo_id,
            "cosecha_id": ic.cosecha_id,
            "cantidad": ic.cantidad,
            "nombre_comercial": ic.insumo.nombre_comercial,
            "costo_unitario": ic.insumo.costo_unitario,
        }
        for ic in relaciones
    ]
    return salida


@router.delete(
    "/cosechas/{ic_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def _delete_insumo_cosecha(
    ic_id: int,
    db: AsyncSession = Depends(get_db),
):
    obj = await get_insumo_cosecha(db, ic_id)
    if not obj:
        raise HTTPException(404, "Registro no encontrado")
    await delete_insumo_cosecha(db, obj)

