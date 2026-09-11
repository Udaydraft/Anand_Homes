import pytest
from httpx import AsyncClient


async def get_auth_token(client: AsyncClient, email: str = "test.agent@anandhomes.com") -> str:
    """Helper to register and obtain a JWT access token for testing."""
    reg_payload = {
        "name": "Test Agent",
        "email": email,
        "password": "Password@123",
    }
    reg_res = await client.post("/api/auth/register", json=reg_payload)
    if reg_res.status_code == 201:
        return reg_res.json()["data"]["tokens"]["access_token"]
    
    # Otherwise login
    login_res = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "Password@123"},
    )
    return login_res.json()["data"]["tokens"]["access_token"]


@pytest.mark.asyncio
async def test_list_properties_and_filtering(client: AsyncClient):
    token = await get_auth_token(client, "test.prop.list@anandhomes.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Create two test properties
    p1 = {
        "title": "Anna Nagar Test Apartment",
        "description": "Lovely 3BHK flat",
        "propertyType": "Apartment",
        "location": "Anna Nagar, Chennai",
        "price": 12000000,
        "bedrooms": 3,
        "bathrooms": 2,
        "areaSqFt": 1500,
        "status": "available",
        "featured": True,
        "imageUrl": "https://example.com/p1.jpg",
        "galleryImages": [],
        "amenities": ["Parking", "Lift"],
    }
    p2 = {
        "title": "ECR Beachfront Villa",
        "description": "4BHK luxury villa",
        "propertyType": "Villa",
        "location": "ECR, Chennai",
        "price": 35000000,
        "bedrooms": 4,
        "bathrooms": 4,
        "areaSqFt": 3200,
        "status": "available",
        "featured": False,
        "imageUrl": "https://example.com/p2.jpg",
        "galleryImages": [],
        "amenities": ["Pool", "Sea View"],
    }

    res1 = await client.post("/api/properties", json=p1, headers=headers)
    assert res1.status_code == 201
    res2 = await client.post("/api/properties", json=p2, headers=headers)
    assert res2.status_code == 201

    # Test list all
    all_res = await client.get("/api/properties")
    assert all_res.status_code == 200
    all_data = all_res.json()["data"]
    assert len(all_data) >= 2

    # Filter by propertyType=Villa
    villa_res = await client.get("/api/properties?propertyType=Villa")
    assert villa_res.status_code == 200
    villas = villa_res.json()["data"]
    assert all(v["propertyType"] == "Villa" for v in villas)

    # Search keyword
    search_res = await client.get("/api/properties?search=Beachfront")
    assert search_res.status_code == 200
    matches = search_res.json()["data"]
    assert any("Beachfront" in m["title"] for m in matches)


@pytest.mark.asyncio
async def test_property_details_and_favorite_flow(client: AsyncClient):
    token = await get_auth_token(client, "test.fav.user@anandhomes.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Create property
    prop_data = {
        "title": "Velachery 2BHK Apartment",
        "description": "Close to metro and railway station",
        "propertyType": "Apartment",
        "location": "Velachery, Chennai",
        "price": 6500000,
        "bedrooms": 2,
        "bathrooms": 2,
        "areaSqFt": 1050,
        "status": "available",
        "featured": True,
        "imageUrl": "https://example.com/v2.jpg",
    }
    c_res = await client.post("/api/properties", json=prop_data, headers=headers)
    prop_id = c_res.json()["data"]["id"]

    # Toggle favorite ON
    fav_on = await client.post(f"/api/properties/{prop_id}/favorite", headers=headers)
    assert fav_on.status_code == 200
    assert fav_on.json()["data"]["favorited"] is True

    # Check GET /api/favorites
    fav_list_res = await client.get("/api/favorites", headers=headers)
    assert fav_list_res.status_code == 200
    fav_items = fav_list_res.json()["data"]
    assert any(f["id"] == prop_id for f in fav_items)

    # Check GET /api/properties/{id} reflects isFavorite = True
    single_res = await client.get(f"/api/properties/{prop_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["data"]["isFavorite"] is True

    # Toggle favorite OFF
    fav_off = await client.post(f"/api/properties/{prop_id}/favorite", headers=headers)
    assert fav_off.status_code == 200
    assert fav_off.json()["data"]["favorited"] is False

    # Check GET /api/favorites is updated
    fav_list_res2 = await client.get("/api/favorites", headers=headers)
    assert not any(f["id"] == prop_id for f in fav_list_res2.json()["data"])


@pytest.mark.asyncio
async def test_enquiry_submission_and_tracking(client: AsyncClient):
    token = await get_auth_token(client, "test.enquiry.user@anandhomes.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Submit enquiry
    enq_payload = {
        "propertyId": "PROP-DEMO-001",
        "message": "Interested in booking this property, please contact me regarding price negotiation.",
        "phone": "+91 99887 76655",
        "name": "Test Client",
    }
    enq_res = await client.post("/api/enquiries", json=enq_payload, headers=headers)
    assert enq_res.status_code == 201
    enq_id = enq_res.json()["data"]["id"]
    assert enq_res.json()["data"]["status"] == "new"

    # List enquiries
    list_res = await client.get("/api/enquiries", headers=headers)
    assert list_res.status_code == 200
    enqs = list_res.json()["data"]
    assert any(e["id"] == enq_id for e in enqs)

    # Update enquiry status
    patch_res = await client.patch(
        f"/api/enquiries/{enq_id}/status",
        json={"status": "in_progress", "agentNotes": "Called client, scheduled demo."},
        headers=headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "in_progress"


@pytest.mark.asyncio
async def test_users_me_profile_retrieval_and_update(client: AsyncClient):
    token = await get_auth_token(client, "test.me.user@anandhomes.com")
    headers = {"Authorization": f"Bearer {token}"}

    # GET /api/users/me
    me_res = await client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["email"] == "test.me.user@anandhomes.com"

    # PUT /api/users/me
    update_res = await client.put(
        "/api/users/me",
        json={"name": "Updated User Profile Name"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "Updated User Profile Name"


@pytest.mark.asyncio
async def test_unified_dashboard_endpoint(client: AsyncClient):
    token = await get_auth_token(client, "test.dashboard.user@anandhomes.com")
    headers = {"Authorization": f"Bearer {token}"}

    # GET /api/dashboard
    dash_res = await client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    body = dash_res.json()
    assert body["success"] is True
    data = body["data"]
    assert "userSummary" in data
    assert "propertiesCount" in data
    assert "favoritesCount" in data
    assert "enquiriesCount" in data
    assert "totalStockValueFormatted" in data
    assert "featuredProperties" in data
