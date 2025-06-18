# models/user.py
from core.db import get_db
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey
from core.db import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
import os
from dotenv import load_dotenv
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from fastapi_users import BaseUserManager, IntegerIDMixin
from fastapi import Depends
from core.db import get_db
from models.tipo_documento import TipoDocumento
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from services.email_service import on_after_register, on_after_forgot_password

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')


class Usuario(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    tipo_persona = Column(String(50))
    razon_social = Column(String(100), nullable=True)
    telefono = Column(String(50))
    direccion = Column(String(255), nullable=True)
    pagina_web = Column(String(100), nullable=True)
    rut = Column(String(255))
    logo = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    tipo_documento_id = Column(Integer, ForeignKey(
        "tipo_documento.id"))
    num_documento = Column(String(50))

    tipo_documento = relationship("TipoDocumento", lazy="joined")
    predios = relationship("Predio", back_populates="usuario")
    exportaciones = relationship("Exportacion", back_populates="usuario")


async def get_user_db():
    async for db in get_db():
        yield SQLAlchemyUserDatabase(db, Usuario)


class UserManager(IntegerIDMixin, BaseUserManager[Usuario, int]):
    reset_password_token_secret = SECRET_KEY
    verification_token_secret = SECRET_KEY

    def __init__(self, user_db):
        super().__init__(user_db)

    async def on_after_register(self, user: Usuario, request=None):
        await on_after_register(user, request)

    async def on_after_forgot_password(self, user: Usuario, token: str, request=None):
        await on_after_forgot_password(user, token, request)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
