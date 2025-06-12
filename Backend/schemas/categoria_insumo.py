from pydantic import BaseModel

class CategoriaInsumoCreate(BaseModel):
    nombre: str

class CategoriaInsumoRead(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True

class CategoriaInsumoUpdate(BaseModel):
    nombre: str
