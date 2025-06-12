from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.insumo_cosecha import InsumoCosecha
from schemas.insumo_cosecha import InsumoCosechaCreate, InsumoCosechaUpdate

class InsumoCosechaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, in_data: InsumoCosechaCreate) -> InsumoCosecha:
        ic = InsumoCosecha(**in_data.model_dump())
        self.db.add(ic)
        await self.db.commit()
        await self.db.refresh(ic)
        return ic

    async def list(self, skip: int = 0, limit: int = 100) -> list[InsumoCosecha]:
        q = await self.db.execute(
            select(InsumoCosecha).offset(skip).limit(limit)
        )
        return q.scalars().all()

    async def get(self, ic_id: int) -> InsumoCosecha | None:
        return await self.db.get(InsumoCosecha, ic_id)

    async def update(self, ic: InsumoCosecha, data: InsumoCosechaUpdate) -> InsumoCosecha:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(ic, field, value)
        await self.db.commit()
        await self.db.refresh(ic)
        return ic

    async def delete(self, ic: InsumoCosecha) -> None:
        await self.db.delete(ic)
        await self.db.commit()
