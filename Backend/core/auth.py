# api/auth.py
import os
from dotenv import load_dotenv
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, BearerTransport
from models.usuario import get_user_manager, Usuario

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

fastapi_users = FastAPIUsers[Usuario, int](
    get_user_manager=get_user_manager,
    auth_backends=[auth_backend]
)
