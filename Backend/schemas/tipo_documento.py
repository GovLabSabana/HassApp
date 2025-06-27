from pydantic import BaseModel, ConfigDict

class TipoDocumentoCreate(BaseModel):
    name: str
class TipoDocumentoRead(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)
