# api/fake_data.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.db import get_db
from faker import Faker
import random
from datetime import datetime, timedelta
from utils.current_user import current_user


router = APIRouter(
    prefix="/fake", tags=["fake-data"], dependencies=[Depends(current_user)])
fake = Faker("es_CO")


@router.post("/llenar-db")
async def fill_database(db: AsyncSession = Depends(get_db)):
    # 1) Desactivar FK checks
    await db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

    # 2) tipo_documento
    tipos = [
        (1, "Cédula de Ciudadanía"),
        (2, "NIT"),
        (3, "Cédula de Extranjería"),
    ]
    for id_, name in tipos:
        await db.execute(
            text(
                "INSERT INTO tipo_documento (id, name) "
                "VALUES (:id, :name) "
                "ON DUPLICATE KEY UPDATE name = VALUES(name)"
            ),
            {"id": id_, "name": name},
        )

    # 3) municipio
    """municipios = [
        (1, "Socha", 15),
        (2, "La_Peña", 25),
        (3, "Dibulla", 44),
    ]
    for id_, name, departamento_id in municipios:
        await db.execute(
            text(
                "INSERT INTO municipio (id, name, departamento_id) "
                "VALUES (:id, :name, :departamento_id) "
                "ON DUPLICATE KEY UPDATE "
                "name = VALUES(name), departamento_id = VALUES(departamento_id)"
            ),
            {"id": id_, "name": name, "departamento_id": departamento_id},
        )
    """
    # 4) categoria_insumo
    categorias = [
        (1, "Fertilizante"),
        (2, "Fungicida"),
        (3, "Insecticida"),
    ]
    for id_, nombre in categorias:
        await db.execute(
            text(
                "INSERT INTO categoria_insumo (id, nombre) "
                "VALUES (:id, :nombre) "
                "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)"
            ),
            {"id": id_, "nombre": nombre},
        )

    # 5) proveedor
    for i in range(1, 6):
        await db.execute(
            text(
                "INSERT INTO proveedor "
                "(id, nombre, municipio_id) "
                "VALUES (:id, :nombre, :municipio_id ) "
                "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)"
            ),
            {
                "id": i,
                "nombre": fake.company(),

                "municipio_id": random.choice([1, 2, 3]),

            },
        )

    # 6) insumo
    for i in range(1, 11):
        await db.execute(
            text(
                "INSERT INTO insumo "
                "(id, nombre_comercial, unidad, categoria_id, proveedor_id, costo_unitario) "
                "VALUES (:id, :nc, :u, :cid, :pid, :costo) "

            ),
            {
                "id": i,
                "nc": fake.word().capitalize(),
                "u": random.choice(["kg", "l", "unidad"]),
                "cid": random.choice([1, 2, 3]),
                "pid": random.randint(1, 5),
                "costo": round(random.uniform(1000, 20000), 2),

            },
        )

    # 7) usuario
    for i in range(1, 6):
        created_at = datetime.now() - timedelta(days=random.randint(1, 365))
        await db.execute(
            text(
                "INSERT INTO usuario "
                "(id, tipo_persona, razon_social, tipo_documento_id, num_documento, telefono, direccion, email, pagina_web, rut, logo, hashed_password, is_active, is_superuser, is_verified, created_at)"
                "VALUES (:id, :tp, :rs, :td, :nd, :tel, :dir, :email, :web, :rut, :logo, :hs, :is_A, :is_S, :is_V, :ca)"
                "ON DUPLICATE KEY UPDATE email = VALUES(email)"
            ),
            {
                "id": i,
                "tp": random.choice(["Natural", "Jurídica"]),
                "rs": fake.company(),
                "td": random.choice([1, 2, 3]),
                "nd": fake.unique.numerify("###########"),
                "tel": fake.phone_number(),
                "dir": fake.address(),
                "email": fake.unique.email(),
                "web": fake.url(),
                "rut": fake.bothify("##.###.###-#"),
                "logo": fake.image_url(),
                "hs": True,
                "is_A": True,
                "is_S": True,
                "is_V": True,
                "ca": created_at,

            },
        )

    # 8) predio
    for i in range(1, 6):
        await db.execute(
            text(
                "INSERT INTO predio "
                "(id, nombre, cedula_catastral, municipio_id, usuario_id, vereda, direccion, hectareas, vocacion, altitud_promedio, tipo_riego) "
                "VALUES (:id, :nombre, :cc, :mid, :uid, :ver, :dir, :hct, :voc, :alt, :rie)"
            ),
            {
                "id": i,
                "nombre": f"Finca {fake.last_name()}",
                "cc": fake.unique.random_number(digits=10),
                "mid": random.choice([1, 2, 3]),
                "uid": random.randint(1, 5),
                "ver": fake.word().capitalize(),
                "dir": fake.address(),
                "hct": round(random.uniform(1, 50), 2),
                "voc": random.choice(["Aguacate", "Mixto", "Hortalizas"]),
                "alt": round(random.uniform(800, 2500), 2),
                "rie": random.choice(["Goteo", "Aspersión", "Manual"]),
            },
        )

    # 9) calidad y 10) producto
    for id_, desc in [(1, "Alta"), (2, "Media"), (3, "Baja")]:
        await db.execute(
            text(
                "INSERT INTO calidad (id, descripcion) "
                "VALUES (:id, :desc) "
                "ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)"
            ),
            {"id": id_, "desc": desc},
        )
    for id_, nombre in [(1, "Aguacate Hass"), (2, "Limón Tahití")]:
        await db.execute(
            text(
                "INSERT INTO producto (id, nombre) "
                "VALUES (:id, :nombre) "
                "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)"
            ),
            {"id": id_, "nombre": nombre},
        )

    # 11) cosecha
    for i in range(1, 9):
        fecha = datetime.now() - timedelta(days=random.randint(1, 180))
        await db.execute(
            text(
                "INSERT INTO cosecha "
                "(id, fecha, producto_id, calidad_id, toneladas, hectareas, calibre_promedio, observaciones) "
                "VALUES (:id, :fecha, :pid, :cid, :ton, :hct, :cal, :obs)"
            ),
            {
                "id": i,
                "fecha": fecha.date(),
                "pid": random.choice([1, 2]),
                "cid": random.choice([1, 2, 3]),
                "ton": round(random.uniform(1, 10), 2),
                "hct": round(random.uniform(0.5, 5), 2),
                "cal": round(random.uniform(12, 25), 2),
                "obs": fake.sentence(6),
            },
        )

    # 12) cosecha_predio
    link_id = 1
    for cosecha_id in range(1, 9):
        for _ in range(random.randint(1, 2)):
            await db.execute(
                text(
                    "INSERT INTO cosecha_predio ( cosecha_id, predio_id) "
                    "VALUES  (:cid, :pid)"
                    "ON DUPLICATE KEY UPDATE cosecha_id = VALUES(cosecha_id)"
                ),
                {"cid": cosecha_id, "pid": random.randint(1, 5)},
            )
            link_id += 1

    # 13) insumo_cosecha
    ic_id = 1
    for cosecha_id in range(1, 9):
        for _ in range(random.randint(1, 3)):
            await db.execute(
                text(
                    "INSERT INTO insumo_cosecha "
                    "(id, insumo_id, cosecha_id, cantidad, costo_unitario) "
                    "VALUES (:id, :iid, :cid, :cant, :c)"
                ),
                {
                    "id": ic_id,
                    "iid": random.randint(1, 10),
                    "cid": cosecha_id,
                    "cant": round(random.uniform(5, 50), 2),
                    "c": round(random.uniform(1000, 5000), 2),
                },
            )
            ic_id += 1

    # 14) comprador
    for i in range(1, 5):
        await db.execute(
            text(
                "INSERT INTO comprador "
                "(id, nombre, tipo_doc, num_doc, ciudad, pais, direccion, contacto) "
                "VALUES (:id, :nombre, :td, :nd, :ciu, :pais, :dir, :cont)"
            ),
            {
                "id": i,
                "nombre": fake.company(),
                "td": random.choice([1, 2, 3]),
                "nd": fake.numerify("#########"),
                "ciu": fake.city(),
                "pais": fake.country(),
                "dir": fake.address(),
                "cont": fake.phone_number(),
            },
        )

    # 15) exportacion
    for i in range(1, 6):
        fecha = datetime.now() - timedelta(days=random.randint(1, 120))
        toneladas = round(random.uniform(1, 8), 2)
        await db.execute(
            text(
                "INSERT INTO exportacion "
                "(id, fecha, metodo_salida, toneladas, valor_fob, puerto_salida, puerto_llegada, comprador_id) "
                "VALUES (:id, :fecha, :met, :ton, :fob, :ps, :pl, :cid)"
            ),
            {
                "id": i,
                "fecha": fecha.date(),
                "met": random.choice(["Marítimo", "Aéreo", "Terrestre"]),
                "ton": toneladas,
                "fob": round(toneladas * random.uniform(500, 1000), 2),
                "ps": fake.city() + " Port",
                "pl": fake.city() + " Port",
                "cid": random.randint(1, 4),
            },
        )

    # 16) exportacion_cosecha
    ec_id = 1
    for exp_id in range(1, 6):
        for _ in range(random.randint(1, 2)):
            await db.execute(
                text(
                    "INSERT INTO exportacion_cosecha "
                    "(id, exportacion_id, cosecha_id) "
                    "VALUES (:id, :eid, :cid)"
                ),
                {"id": ec_id, "eid": exp_id, "cid": random.randint(1, 8)},
            )
            ec_id += 1

    # 17) Reactivar FK checks y commit
    await db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    await db.commit()

    return {"message": "Datos dummy insertados correctamente."}
