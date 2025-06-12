from models.usuario import Usuario
from fastapi import Body
from fastapi_users import BaseUserManager, exceptions
from fastapi_users.password import PasswordHelper
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from schemas.usuario import UsuarioRead, UsuarioCreate, UsuarioUpdate
from core.auth import auth_backend, fastapi_users
from models.usuario import UserManager, get_user_manager
from repositories.usuario import create_user_with_files
from utils.current_user import current_user
from fastapi_users.schemas import BaseUserUpdate

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

password_helper = PasswordHelper()


@custom_router.post("/change-password")
async def change_password(
    old_password: str = Body(...),
    new_password: str = Body(...),
    user: Usuario = Depends(current_user),
    user_manager=Depends(get_user_manager),
):
    is_valid, _ = password_helper.verify_and_update(
        old_password, user.hashed_password)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )

    try:

        user_db = await user_manager.get(user.id)
        user_update = BaseUserUpdate(password=new_password)

        await user_manager.update(
            user=user_db,
            user_update=user_update,
            safe=True,
            request=None,
        )

    except exceptions.UserAlreadyExists:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    return {"message": "Contraseña actualizada exitosamente"}

router = APIRouter()


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
router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
