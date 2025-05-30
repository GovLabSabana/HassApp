from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class UserRead(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]

    # << Esto habilita orm_mode en Pydantic v2
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str]

    def create_update_dict(self):
        return self.model_dump(exclude_unset=True)


class UserUpdate(BaseModel):
    email: Optional[EmailStr]
    name: Optional[str]
