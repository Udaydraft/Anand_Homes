import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_workflow_key_screens_crud(client: AsyncClient):
    # 1. Project Master
    res_proj = await client.get("/api/projects")
    assert res_proj.status_code == 200
    assert isinstance(res_proj.json()["data"], list)

    # Create new project
    create_proj = await client.post("/api/projects", json={
        "projectName": "Apex Heights",
        "siteName": "Tower 4",
        "status": "Active"
    })
    assert create_proj.status_code == 200
    created_p = create_proj.json()["data"]
    p_id = created_p["id"]
    assert created_p["projectName"] == "Apex Heights"

    # 2. Supervisor Master
    res_sup = await client.get("/api/supervisors")
    assert res_sup.status_code == 200
    assert isinstance(res_sup.json()["data"], list)

    create_sup = await client.post("/api/supervisors", json={
        "name": "Karthik Raja",
        "loginId": "karthik",
        "password": "pwd",
        "project": "Apex Heights",
        "site": "Tower 4"
    })
    assert create_sup.status_code == 200
    sup_id = create_sup.json()["data"]["id"]

    # 3. Project Duration
    create_dur = await client.post("/api/project-durations", json={
        "projectName": "Apex Heights",
        "siteName": "Tower 4",
        "fromDate": "01-10-2025",
        "toDate": "31-10-2026"
    })
    assert create_dur.status_code == 200
    dur_id = create_dur.json()["data"]["id"]

    res_dur = await client.get("/api/project-durations")
    assert res_dur.status_code == 200
    assert any(d["id"] == dur_id for d in res_dur.json()["data"])

    # 4. Inventory Master
    res_im = await client.get("/api/inventory-master")
    assert res_im.status_code == 200
    assert isinstance(res_im.json()["data"], list)

    create_im = await client.post("/api/inventory-master", json={
        "category": "Steel",
        "material": "TMT 20mm High Tensile",
        "measurement": "Tons",
        "materialType": "Prime",
        "natureOfWork": ["Construction", "Testing"]
    })
    assert create_im.status_code == 200
    im_id = create_im.json()["data"]["id"]

    # 5. Inward Material Entry
    create_inw = await client.post("/api/material-inward", json={
        "date": "10-10-2025",
        "category": "Steel",
        "material": "TMT 20mm High Tensile",
        "quantity": 10.0,
        "measurement": "Tons",
        "totalValue": 700000.0
    })
    assert create_inw.status_code == 200
    inw_item = create_inw.json()["data"]
    assert inw_item["entryCode"].startswith("INW-")
    assert inw_item["unitPrice"] == 70000.0

    # 6. Outward Material Entry
    create_outw = await client.post("/api/material-outward", json={
        "date": "11-10-2025",
        "project": "Apex Heights",
        "site": "Tower 4",
        "natureOfWork": "Construction",
        "quantity": 2.5,
        "measurement": "Tons"
    })
    assert create_outw.status_code == 200
    assert create_outw.json()["data"]["quantity"] == 2.5

    # 7. Labour Entry
    create_lab = await client.post("/api/labour-entries", json={
        "date": "11-10-2025",
        "project": "Apex Heights",
        "site": "Tower 4",
        "natureOfWork": "Construction",
        "type": "Count (Labour)",
        "workerCount": 32
    })
    assert create_lab.status_code == 200
    lab_id = create_lab.json()["data"]["id"]

    # Clean up test creations
    await client.delete(f"/api/projects/{p_id}")
    await client.delete(f"/api/supervisors/{sup_id}")
    await client.delete(f"/api/project-durations/{dur_id}")
    await client.delete(f"/api/inventory-master/{im_id}")
    await client.delete(f"/api/labour-entries/{lab_id}")
