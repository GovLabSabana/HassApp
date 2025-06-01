# api/auth.py
from fastapi import APIRouter
from schemas.user import UserRead, UserCreate
from core.auth import auth_backend, fastapi_users

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
