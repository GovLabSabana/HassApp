from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.insumo import Insumo
from schemas.insumos import InsumoCreate, InsumoUpdate

class InsumoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, in_data: InsumoCreate) -> Insumo:
        insumo = Insumo(**in_data.model_dump())
        self.db.add(insumo)
        await self.db.commit()
        await self.db.refresh(insumo)
        return insumo

    async def list(self, skip: int = 0, limit: int = 100) -> list[Insumo]:
        q = await self.db.execute(
            select(Insumo).offset(skip).limit(limit)
        )
        return q.scalars().all()

    async def get(self, insumo_id: int) -> Insumo | None:
        return await self.db.get(Insumo, insumo_id)

    async def update(self, insumo: Insumo, data: InsumoUpdate) -> Insumo:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(insumo, field, value)
        await self.db.commit()
        await self.db.refresh(insumo)
        return insumo

    async def delete(self, insumo: Insumo) -> None:
        await self.db.delete(insumo)
        await self.db.commit()
