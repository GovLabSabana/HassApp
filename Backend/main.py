# main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from api import users, auth  # Importa auth aquí

load_dotenv()

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}


# Incluye los routers
app.include_router(users.router)
app.include_router(auth.router)  # Aquí agregas el router de auth
