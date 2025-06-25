from fastapi.testclient import TestClient
import os
from dotenv import load_dotenv
import pytest
from httpx import AsyncClient
from main import app

load_dotenv(dotenv_path=".env.test")

BACK_URL = os.getenv('BACKEND_URL'),


@pytest.mark.asyncio
async def test_login_correcto():
    client = TestClient(app)
    response = client.post(
        "/auth/jwt/login",
        data={"username": "da@gmail.com", "password": "123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200
    json = response.json()
    assert "access_token" in json
    assert json["token_type"] == "bearer"
