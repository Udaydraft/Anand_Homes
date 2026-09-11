import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_seed_and_list_sites(client: AsyncClient):
    # 1. Trigger Seed
    seed_res = await client.post("/api/seed")
    assert seed_res.status_code == 200

    # 2. List Sites
    sites_res = await client.get("/api/sites")
    assert sites_res.status_code == 200
    body = sites_res.json()
    assert body["success"] is True
    assert len(body["data"]) >= 3
    site_names = [s["name"] for s in body["data"]]
    assert "Site Alpha" in site_names
    assert "Site Beta" in site_names


@pytest.mark.asyncio
async def test_create_and_delete_site(client: AsyncClient):
    new_site = {
        "code": "RBL-S-004",
        "name": "Site Delta",
        "location": "Trichy, TN",
        "supervisor": "Murugan K",
        "status": "Active",
        "totalMaterials": 10,
        "stockValue": 250000,
        "contact": "98765 00000",
        "projectType": "Warehouse",
    }
    create_res = await client.post("/api/sites", json=new_site)
    assert create_res.status_code == 201
    created_site = create_res.json()["data"]
    site_id = created_site["id"]
    assert created_site["name"] == "Site Delta"

    # Get Single Site
    get_res = await client.get(f"/api/sites/{site_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["code"] == "RBL-S-004"

    # Update Site
    update_res = await client.put(f"/api/sites/{site_id}", json={"location": "Tiruchirappalli, TN"})
    assert update_res.status_code == 200
    assert update_res.json()["data"]["location"] == "Tiruchirappalli, TN"

    # Delete Site
    del_res = await client.delete(f"/api/sites/{site_id}")
    assert del_res.status_code == 200

    # Verify Deletion
    get_again = await client.get(f"/api/sites/{site_id}")
    assert get_again.status_code == 404


@pytest.mark.asyncio
async def test_stock_in_and_out(client: AsyncClient):
    # Seed first
    await client.post("/api/seed")

    # Check initial stock
    inv_res = await client.get("/api/inventory?site=Site%20Alpha")
    initial_cement = next(item for item in inv_res.json()["data"] if "UltraTech" in item["name"])
    initial_stock = initial_cement["totalStock"]

    # Stock In
    stock_in_payload = {
        "site": "Site Alpha",
        "material": "UltraTech PPC Cement",
        "quantity": 50,
        "unit": "Bags",
        "supplier": "UltraTech Hub",
        "invoiceNo": "INV-TEST-01",
        "deliveryDate": "11 Mar 2025",
        "notes": "Test stock in",
    }
    in_res = await client.post("/api/stock/in", json=stock_in_payload)
    assert in_res.status_code == 201

    # Check updated stock
    inv_after_in = await client.get("/api/inventory?site=Site%20Alpha")
    updated_cement = next(item for item in inv_after_in.json()["data"] if "UltraTech" in item["name"])
    assert updated_cement["totalStock"] == initial_stock + 50

    # Stock Out
    stock_out_payload = {
        "site": "Site Alpha",
        "material": "UltraTech PPC Cement",
        "quantity": 20,
        "unit": "Bags",
        "usedFor": "Slab reinforcement",
        "requestedBy": "Site Supervisor",
        "notes": "Test stock out",
    }
    out_res = await client.post("/api/stock/out", json=stock_out_payload)
    assert out_res.status_code == 201

    # Check final stock
    inv_after_out = await client.get("/api/inventory?site=Site%20Alpha")
    final_cement = next(item for item in inv_after_out.json()["data"] if "UltraTech" in item["name"])
    assert final_cement["totalStock"] == initial_stock + 50 - 20


@pytest.mark.asyncio
async def test_material_requests_lifecycle(client: AsyncClient):
    req_payload = {
        "site": "Site Alpha",
        "material": "Reinforcement Steel",
        "quantity": 5,
        "unit": "Tons",
        "requestedBy": "Engineer Ramesh",
        "purpose": "Roof slab",
        "requiredDate": "15 Mar 2025",
    }
    create_res = await client.post("/api/requests", json=req_payload)
    assert create_res.status_code == 201
    created_req = create_res.json()["data"]
    req_id = created_req["id"]
    assert created_req["status"] == "Pending"

    # Update Status to Approved
    patch_res = await client.patch(f"/api/requests/{req_id}/status", json={"status": "Approved"})
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "Approved"

    # List Requests
    list_res = await client.get("/api/requests?site=Site%20Alpha")
    assert list_res.status_code == 200
    req_ids = [r["id"] for r in list_res.json()["data"]]
    assert req_id in req_ids


@pytest.mark.asyncio
async def test_deliveries_crud(client: AsyncClient):
    deliv_payload = {
        "supplier": "Dalmia Cement Corp",
        "site": "Site Beta",
        "material": "Dalmia Pozzolana Cement",
        "expectedQty": 200,
        "receivedQty": 0,
        "unit": "Bags",
        "status": "Expected",
    }
    res = await client.post("/api/deliveries", json=deliv_payload)
    assert res.status_code == 201
    deliv = res.json()["data"]
    deliv_id = deliv["id"]

    # Update Delivery status to Received
    update_res = await client.put(
        f"/api/deliveries/{deliv_id}",
        json={"status": "Received", "receivedQty": 200, "receivedBy": "Supervisor Siva"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["status"] == "Received"
    assert update_res.json()["data"]["receivedQty"] == 200


@pytest.mark.asyncio
async def test_dashboard_summary(client: AsyncClient):
    await client.post("/api/seed")
    res = await client.get("/api/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()["data"]
    assert summary["totalSites"] >= 3
    assert summary["activeSites"] >= 3
    assert summary["totalMaterials"] >= 7
