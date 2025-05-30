# api/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.user import User
from core.db import get_db


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
