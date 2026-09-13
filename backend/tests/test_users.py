import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_crud_flow(client: AsyncClient):
    # 1. Create supervisor
    create_payload = {
        "name": "Supervisor Test",
        "email": "supervisor.test@anandhomes.com",
        "password": "Password123!",
        "role": "supervisor",
    }
    create_res = await client.post("/api/users", json=create_payload)
    assert create_res.status_code == 201
    created_user = create_res.json()["data"]
    assert created_user["name"] == "Supervisor Test"
    assert created_user["email"] == "supervisor.test@anandhomes.com"
    assert created_user["role"] == "supervisor"
    user_id = created_user["id"]

    # 2. List users with role filter
    list_res = await client.get("/api/users?role=supervisor")
    assert list_res.status_code == 200
    users_list = list_res.json()["data"]
    assert any(u["id"] == user_id for u in users_list)

    # 3. Get user by ID
    get_res = await client.get(f"/api/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "Supervisor Test"

    # 4. Update user
    update_payload = {
        "name": "Supervisor Test Updated",
        "email": "supervisor.updated@anandhomes.com",
    }
    update_res = await client.put(f"/api/users/{user_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_user = update_res.json()["data"]
    assert updated_user["name"] == "Supervisor Test Updated"
    assert updated_user["email"] == "supervisor.updated@anandhomes.com"

    # 5. Delete user
    delete_res = await client.delete(f"/api/users/{user_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True

    # 6. Verify deleted user is gone
    get_after_delete = await client.get(f"/api/users/{user_id}")
    assert get_after_delete.status_code == 404
