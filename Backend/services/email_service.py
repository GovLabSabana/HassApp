import os
import smtplib
from email.message import EmailMessage
from fastapi_users.models import UserProtocol
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email(subject: str, to: str, plain_body: str, html_body: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to

    # Versión en texto plano
    msg.set_content(plain_body)

    # Versión en HTML
    msg.add_alternative(html_body, subtype="html")

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)


async def on_after_register(user: UserProtocol, request=None):
    plain_body = "Gracias por registrarte. Pronto recibirás más información"
    html_body = f"""
    <html>
        <body>
            <h1>¡Bienvenido, {user.email}!</h1>
            <p>Gracias por registrarte. <strong>Pronto recibirás más información</strong>.</p>
        </body>
    </html>
    """
    send_email(
        subject="Bienvenido",
        to=user.email,
        plain_body=plain_body,
        html_body=html_body
    )


async def on_after_forgot_password(user: UserProtocol, token: str, request=None):
    reset_link = f"https://heartfelt-success-production-8486.up.railway.app/reset?token={token}"
    plain_body = f"Usa este link para recuperar tu contraseña: {reset_link}"
    html_body = f"""
    <html>
        <body>
            <p>Hola <strong>{user.email}</strong>,</p>
            <p>Puedes recuperar tu contraseña haciendo clic en el siguiente enlace:</p>
            <p><a href="{reset_link}">Recuperar contraseña</a></p>
            <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
        </body>
    </html>
    """
    send_email(
        subject="Recuperación de contraseña",
        to=user.email,
        plain_body=plain_body,
        html_body=html_body
    )
