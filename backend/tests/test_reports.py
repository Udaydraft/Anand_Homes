import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_generate_and_download_reports(client: AsyncClient):
    # 1. Test Daily Stock Report JSON preview
    res = await client.get("/api/reports/daily-stock")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert "headers" in body["data"]
    assert "rows" in body["data"]
    assert "summary" in body["data"]
    assert body["data"]["reportType"] == "daily-stock"

    # 2. Test Material Movement Report JSON
    res_mv = await client.get("/api/reports/material-movement")
    assert res_mv.status_code == 200
    assert res_mv.json()["data"]["reportType"] == "material-movement"

    # 3. Test CSV Download
    download_res = await client.get("/api/reports/daily-stock/download")
    assert download_res.status_code == 200
    assert "text/csv" in download_res.headers.get("content-type", "")
    assert "attachment" in download_res.headers.get("content-disposition", "")
    csv_text = download_res.text
    assert "ANAND HOMES CONSTRUCTION MANAGEMENT PLATFORM" in csv_text
    assert "Material Name" in csv_text


@pytest.mark.asyncio
async def test_unauthorized_admin_mutation_rejected(client: AsyncClient):
    # Create a supervisor user and login
    sup_payload = {
        "name": "Regular Supervisor",
        "email": "supervisor.rbac@anandhomes.com",
        "password": "Password123!",
        "role": "supervisor",
    }
    await client.post("/api/auth/register", json=sup_payload)
    login_res = await client.post(
        "/api/auth/login",
        json={"email": sup_payload["email"], "password": sup_payload["password"]},
    )
    token = login_res.json()["data"]["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Supervisor attempting to delete a user must be rejected with 403 Forbidden
    del_res = await client.delete("/api/users/some-target-id", headers=headers)
    assert del_res.status_code == 403
    assert "administrator privileges" in del_res.json()["detail"].lower()
