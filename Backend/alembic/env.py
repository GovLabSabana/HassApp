from logging.config import fileConfig

from sqlalchemy import engine_from_config, create_engine
from sqlalchemy import pool
import os
from dotenv import load_dotenv
from core.db import Base
# Modelos más independientes
import models.tipo_documento
import models.departamento
import models.municipio
import models.producto
import models.calidad

# Modelos que empiezan a depender de los anteriores
import models.predio
import models.usuario

# Modelos que dependen de producto, calidad, usuario, predio, etc.
import models.cosecha
import models.insumo_cosecha

# Modelos con relaciones cruzadas más complejas
import models.rompimientos

# Modelos con muchas relaciones cruzadas (exportación <-> cosecha)
import models.exportacion
import models.exportacion_cosecha


from alembic import context

load_dotenv()  # Carga las variables del .env

config = context.config
config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL'))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Tomar la URL del config
    url = config.get_main_option("sqlalchemy.url")

    # Detectar y cambiar driver async a sync
    if url.startswith("mysql+asyncmy://"):
        sync_url = url.replace("mysql+asyncmy://", "mysql+pymysql://")
    elif url.startswith("postgresql+asyncpg://"):
        sync_url = url.replace("postgresql+asyncpg://",
                               "postgresql+psycopg2://")
    else:
        sync_url = url

    # Crear engine sincrónico para alembic
    connectable = create_engine(
        sync_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
