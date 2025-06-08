from fastapi_users import FastAPIUsers
from models.usuario import Usuario, get_user_manager
from core.auth import auth_backend

fastapi_users = FastAPIUsers[Usuario, int](get_user_manager, [auth_backend])
current_user = fastapi_users.current_user()
