# models/user.py
from core.db import get_db
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import Column, String, Integer
from core.db import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
import os
from dotenv import load_dotenv
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from fastapi_users import BaseUserManager, IntegerIDMixin
from fastapi import Depends
from core.db import get_db

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')


class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(50), nullable=True)

    # FastAPI Users ya define: id, email, hashed_password, is_active, is_superuser, etc.


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
