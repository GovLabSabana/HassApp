from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from models.user import UserManager, get_user_manager
from repositories.user import create_user_with_files
from models.user import User
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
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
    cedula: str = Form(None),
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
            cedula=cedula,
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
