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

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')


class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50))
    tipo_persona = Column(String(50))
    razon_social = Column(String(100), nullable=True)
    telefono = Column(String(50))
    direccion = Column(String(100), nullable=True)
    pagina_web = Column(String(100), nullable=True)
    rut = Column(String(255))
    logo = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP)
    tipo_documento_id = Column(Integer, ForeignKey(
        "tipo_documento.id"))
    num_documento = Column(String(50))

    predios = relationship("Predio", back_populates="user")


async def get_user_db():
    async for db in get_db():
        yield SQLAlchemyUserDatabase(db, User)


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET_KEY
    verification_token_secret = SECRET_KEY

    def __init__(self, user_db):
        super().__init__(user_db)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
