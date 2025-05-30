# api/auth.py
import os
from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, BearerTransport

from models.user import get_user_manager, User, get_user_db
from schemas.user import UserRead, UserCreate, UserUpdate

load_dotenv()

# Configuración de JWT


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=os.getenv('SECRET_KEY'), lifetime_seconds=3600)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, int](
    get_user_manager=get_user_manager,
    auth_backends=[auth_backend]
)

# Crear un router para agrupar las rutas
router = APIRouter()

# Rutas de autenticación
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
