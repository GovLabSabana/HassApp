from fastapi import HTTPException
import uuid
from core.s3 import upload_file_to_s3
from schemas.user import UserCreate


async def create_user_with_files(
    email: str,
    password: str,
    nombre: str,
    tipo_persona: str,
    razon_social: str,
    telefono: str,
    direccion: str,
    pagina_web: str,
    cedula: str,
    rut_document,
    logo_document,
    user_manager
):
    urls = {}

    if rut_document:
        rut_filename = f"ruts/rut_{uuid.uuid4()}_{rut_document.filename}"
        url_rut = upload_file_to_s3(rut_document.file, rut_filename)
        urls["rut"] = url_rut
    else:
        urls["rut"] = None

    if logo_document:
        logo_filename = f"logos/logo_{uuid.uuid4()}_{logo_document.filename}"
        url_logo = upload_file_to_s3(logo_document.file, logo_filename)
        urls["logo"] = url_logo
    else:
        urls["logo"] = None

    user_create_dict = {
        "email": email,
        "password": password,
        "nombre": nombre,
        "tipo_persona": tipo_persona,
        "razon_social": razon_social,
        "telefono": telefono,
        "direccion": direccion,
        "pagina_web": pagina_web,
        "cedula": cedula,
        "rut": urls["rut"],
        "logo": urls["logo"],
    }

    user_create_obj = UserCreate(**user_create_dict)
    try:
        user = await user_manager.create(user_create_obj)
    except Exception as e:
        if e.__class__.__name__ == "UserAlreadyExists":
            raise HTTPException(
                status_code=400, detail="El correo ya está registrado.")
        detalle = str(e)
        print(f"Error al crear el usuario: {detalle}")
        raise HTTPException(status_code=400, detail=detalle)

    return user, urls
