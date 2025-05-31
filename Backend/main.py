# main.py
from fastapi import Request
from fastapi.responses import JSONResponse
import os
from sys import prefix
from dotenv import load_dotenv
from fastapi import FastAPI
from api import users, auth, protegida  # Importa auth aquí
from pydantic import ValidationError

load_dotenv()

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


# Incluye los routers
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(protegida.router, prefix="/api")  #

# Maneja los errores de validación de Pydantic


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Error de validación de datos",
            "details": exc.errors()
        }
    )
