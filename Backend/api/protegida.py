# api/rutas.py
from fastapi import APIRouter, Depends
from fastapi_users import FastAPIUsers
from api.auth import auth_backend
from models.user import get_user_manager
from models.user import User  # Asegúrate de tener tu modelo User
from fastapi_users.authentication import AuthenticationBackend

# Instancia de FastAPIUsers
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

router = APIRouter()

# Endpoint protegido - requiere usuario logueado


@router.get("/ruta-protegida")
async def protected_route(user=Depends(fastapi_users.current_user())):
    return {"message": f"Hola, {user.email}! Estás autenticado."}

# Endpoint protegido - solo usuarios activos


@router.get("/solo-activos")
async def only_active(user=Depends(fastapi_users.current_user(active=True))):
    return {"message": f"Bienvenido, usuario activo: {user.email}"}

# Endpoint protegido - solo usuarios verificados


@router.get("/solo-verificados")
async def only_verified(user=Depends(fastapi_users.current_user(verified=True))):
    return {"message": f"Hola, {user.email} (usuario verificado)"}
