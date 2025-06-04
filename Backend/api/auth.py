from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from schemas.usuario import UsuarioRead, UsuarioCreate
from core.auth import auth_backend, fastapi_users
from models.usuario import UserManager, get_user_manager
from repositories.usuario import create_user_with_files

router = APIRouter()

custom_router = APIRouter(prefix="/auth/custom", tags=["auth"])


@custom_router.post("/register")
async def custom_register(
    email: str = Form(...),
    password: str = Form(...),
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


router.include_router(custom_router)

# Rutas estándar de autenticación
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UsuarioRead, UsuarioCreate),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_verify_router(UsuarioRead),
    prefix="/auth",
    tags=["auth"],
)
