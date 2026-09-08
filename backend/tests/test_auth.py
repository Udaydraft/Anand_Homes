import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    payload = {
        "name": "Alice Tester",
        "email": "alice@example.com",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "User registered successfully"
    data = body["data"]
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["name"] == "Alice Tester"
    assert "password_hash" not in data["user"]
    assert "tokens" in data
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]


@pytest.mark.asyncio
async def test_register_duplicate_email_fails(client: AsyncClient):
    payload = {
        "name": "Bob Tester",
        "email": "bob@example.com",
        "password": "SecurePassword123!",
    }
    first = await client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    # Second registration with same email
    second = await client.post("/api/auth/register", json=payload)
    assert second.status_code == 409
    body = second.json()
    assert body["success"] is False


@pytest.mark.asyncio
async def test_login_flow(client: AsyncClient):
    # Register first
    await client.post(
        "/api/auth/register",
        json={"name": "Charlie", "email": "charlie@example.com", "password": "Password123!"},
    )

    # Correct login
    login_res = await client.post(
        "/api/auth/login",
        json={"email": "charlie@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    body = login_res.json()
    assert body["success"] is True
    assert "access_token" in body["data"]["tokens"]

    # Incorrect login
    bad_login = await client.post(
        "/api/auth/login",
        json={"email": "charlie@example.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_and_refresh(client: AsyncClient):
    reg = await client.post(
        "/api/auth/register",
        json={"name": "Dana", "email": "dana@example.com", "password": "Password123!"},
    )
    assert reg.status_code == 201
    tokens = reg.json()["data"]["tokens"]
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Test /api/auth/me with valid Bearer token
    me_res = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    me_body = me_res.json()
    assert me_body["success"] is True
    assert me_body["data"]["email"] == "dana@example.com"
    assert "password_hash" not in me_body["data"]

    # Test /api/auth/refresh
    refresh_res = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    ref_body = refresh_res.json()
    assert ref_body["success"] is True
    assert "access_token" in ref_body["data"]

    # Test /api/auth/logout
    logout_res = await client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True
