# main.py
from fastapi import FastAPI
from api import users
from core.db import Base, engine

app = FastAPI()

# Crear las tablas en la base de datos al iniciar la app
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

# Incluir el router de usuarios
app.include_router(users.router)
