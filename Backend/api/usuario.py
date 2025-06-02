from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from core.db import get_db
from models.usuario import UserManager, get_user_manager, Usuario
from repositories.usuario import create_user_with_files, update_user_with_files
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users import FastAPIUsers
from core.auth import auth_backend

fastapi_users = FastAPIUsers[Usuario, int](get_user_manager, [auth_backend])

# Dependency que devuelve el usuario actual autenticado (lanzará 401 si no está autenticado)
current_user = fastapi_users.current_user()

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario))
    users = result.scalars().all()
    return users


@router.post("/register")
async def custom_register(
    email: str = Form(...),
    password: str = Form(...),
    nombre: str = Form(None),
    tipo_persona: str = Form(None),
    razon_social: str = Form(None),
    telefono: str = Form(None),
    direccion: str = Form(None),
    pagina_web: str = Form(None),
    tipo_documento_id: int = Form(None),
    num_documento: str = Form(None),
    rut_document: UploadFile = File(None),
    logo_document: UploadFile = File(None),
    user_manager: UserManager = Depends(get_user_manager)
):
    try:
        user, urls = await create_user_with_files(
            email=email,
            password=password,
            nombre=nombre,
            tipo_persona=tipo_persona,
            razon_social=razon_social,
            telefono=telefono,
            direccion=direccion,
            pagina_web=pagina_web,
            tipo_documento_id=tipo_documento_id,
            num_documento=num_documento,
            rut_document=rut_document,
            logo_document=logo_document,
            user_manager=user_manager
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "msg": "Usuario creado con éxito",
        "user_id": user.id,
        "rut_url": urls.get("rut"),
        "logo_url": urls.get("logo"),
    }


# api/users.py

@router.put("/update/me")
async def update_me(
    nombre: str = Form(None),
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
            nombre=nombre,
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
