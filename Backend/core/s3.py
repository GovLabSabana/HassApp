import boto3
import os
import mimetypes
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
from urllib.parse import quote, urlsplit, urlunsplit

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_S3_REGION = os.getenv("AWS_S3_REGION_NAME")

session = boto3.Session(
    region_name=AWS_S3_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

s3_client = session.client('s3')


def upload_file_to_s3(file_obj, filename):
    try:
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            content_type = 'application/octet-stream'  # fallback por si no se detecta

        s3_client.upload_fileobj(
            Fileobj=file_obj,
            Bucket=AWS_S3_BUCKET_NAME,
            Key=filename,
            ExtraArgs={
                'ContentType': content_type,
            }
        )
        url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_S3_REGION}.amazonaws.com/{filename}"
        return url_encode_s3_object_url(url)
    except NoCredentialsError:
        raise Exception("Credenciales de AWS no configuradas correctamente")


def url_encode_s3_object_url(url: str) -> str:
    parts = urlsplit(url)
    path = quote(parts.path)
    return urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))
