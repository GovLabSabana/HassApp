from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from schemas.usuario import UsuarioRead
from core.db import get_db
from models.usuario import Usuario
from repositories.usuario import update_user_with_files
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from utils.current_user import current_user

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario))
    users = result.scalars().all()
    return users


@router.get("/me", response_model=UsuarioRead)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(current_user),
):
    result = await db.execute(
        select(Usuario)
        .options(selectinload(Usuario.tipo_documento))
        .where(Usuario.id == current_user.id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user

# api/users.py


@router.put("/update/me")
async def update_me(
    tipo_persona: str = Form(None),
    razon_social: str = Form(None),
    telefono: str = Form(None),
    direccion: str = Form(None),
    pagina_web: str = Form(None),
    tipo_documento_id: int = Form(None),
    num_documento: str = Form(None),
    rut_document: UploadFile = File(None),
    logo_document: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    user: Usuario = Depends(current_user),
):
    try:
        user, urls = await update_user_with_files(
            db=db,
            user_id=user.id,
            tipo_persona=tipo_persona,
            razon_social=razon_social,
            telefono=telefono,
            direccion=direccion,
            pagina_web=pagina_web,
            tipo_documento_id=tipo_documento_id,
            num_documento=num_documento,
            rut_document=rut_document,
            logo_document=logo_document
        )
        # ⚠️ Mueve el return AQUÍ
        return {
            "msg": "Usuario actualizado con éxito",
            "user_id": user.id,
            "rut_url": urls.get("rut"),
            "logo_url": urls.get("logo"),
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
