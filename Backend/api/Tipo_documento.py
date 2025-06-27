from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from schemas.tipo_documento import TipoDocumentoCreate, TipoDocumentoRead
from repositories import tipo_documento

router = APIRouter(prefix="/tipo-documento", tags=["Tipo Documento"])


@router.get("/", response_model=list[TipoDocumentoRead])
async def listar_tipos(db: AsyncSession = Depends(get_db)):
    return await tipo_documento.get_all(db)


@router.get("/{id}", response_model=TipoDocumentoRead)
async def obtener_tipo(id: int, db: AsyncSession = Depends(get_db)):
    tipo = await tipo_documento.get_by_id(db, id)
    if not tipo:
        raise HTTPException(status_code=404, detail="No encontrado")
    return tipo


@router.post("/", response_model=TipoDocumentoRead)
async def crear_tipo(data: TipoDocumentoCreate, db: AsyncSession = Depends(get_db)):
    nuevo = await tipo_documento.create(db, data.name)
    return nuevo


@router.put("/{id}", response_model=TipoDocumentoRead)
async def actualizar_tipo(id: int, data: TipoDocumentoCreate, db: AsyncSession = Depends(get_db)):
    tipo = await tipo_documento.update(db, id, data.name)
    if not tipo:
        raise HTTPException(status_code=404, detail="No encontrado")
    return tipo


@router.delete("/{id}")
async def eliminar_tipo(id: int, db: AsyncSession = Depends(get_db)):
    tipo = await tipo_documento.delete(db, id)
    if not tipo:
        raise HTTPException(status_code=404, detail="No encontrado")
    return {"message": "Eliminado exitosamente"}
