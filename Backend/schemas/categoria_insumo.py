from pydantic import BaseModel, ConfigDict


class CategoriaInsumoCreate(BaseModel):
    nombre: str


class CategoriaInsumoRead(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class CategoriaInsumoUpdate(BaseModel):
    nombre: str
