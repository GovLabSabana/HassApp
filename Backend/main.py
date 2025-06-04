from fastapi import Request, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import ValidationError

from api import auth, protegida, predio, usuario, cosecha

load_dotenv()
app = FastAPI()

# Habilita CORS
app.add_middleware(
    CORSMiddleware,
    # Cambia esto por una lista de dominios permitidos en producción
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(usuario.router)
app.include_router(auth.router)
app.include_router(predio.router)
app.include_router(cosecha.router)
app.include_router(protegida.router, prefix="/api")  # Rutas protegidas

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
