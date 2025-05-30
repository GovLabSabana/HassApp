# api/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.user import User
from core.db import SessionLocal

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

# Dependencia para obtener la sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

