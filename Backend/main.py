from fastapi import Request, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import ValidationError
import os
from api import auth, protegida, predio, usuario, cosecha, comprador, exportaciones, reset_data, fake_data, respuesta, pregunta, insumo, insumo_cosecha, proveedor, estadistica

load_dotenv()

app = FastAPI()
origins = os.getenv("ORIGINS", "")
origins = [origin.strip() for origin in origins.split(",") if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Routerss
app.include_router(usuario.router)
app.include_router(auth.router)
app.include_router(predio.router)
app.include_router(cosecha.router)
app.include_router(protegida.router, prefix="/api")  # Rutas protegidas
app.include_router(comprador.router)
app.include_router(exportaciones.router)
app.include_router(respuesta.router)
app.include_router(pregunta.router)
app.include_router(reset_data.router)
app.include_router(fake_data.router)
app.include_router(insumo.router)
app.include_router(insumo_cosecha.router)
app.include_router(proveedor.router)
app.include_router(estadistica.router)

# Manejo de errores de validación


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Error de validación de datos",
            "details": exc.errors()
        }
    )
