from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.construction import (
    ActivityResponse,
    DashboardSummaryResponse,
    DeliveryCreate,
    DeliveryResponse,
    DeliveryUpdate,
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryResponse,
    MaterialRequestCreate,
    MaterialRequestResponse,
    RequestStatusUpdate,
    SiteCreate,
    SitePhotoCreate,
    SitePhotoResponse,
    SiteResponse,
    SiteUpdate,
    StockInRequest,
    StockOutRequest,
    StockTransactionResponse,
)
from app.schemas.user import ApiResponse
from app.services.construction_service import ConstructionService

router = APIRouter(tags=["Construction Management"])


# ---------------------------------------------------------------------------
# Sites
# ---------------------------------------------------------------------------
@router.get("/sites", response_model=ApiResponse[List[SiteResponse]])
async def list_sites(db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    sites = await service.list_sites()
    return ApiResponse(success=True, message="Sites retrieved successfully", data=sites)


@router.get("/sites/{site_id}", response_model=ApiResponse[SiteResponse])
async def get_site(site_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    site = await service.get_site(site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return ApiResponse(success=True, message="Site retrieved successfully", data=site)


@router.post("/sites", response_model=ApiResponse[SiteResponse], status_code=status.HTTP_201_CREATED)
async def create_site(payload: SiteCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    site = await service.create_site(payload)
    return ApiResponse(success=True, message="Site created successfully", data=site)


@router.put("/sites/{site_id}", response_model=ApiResponse[SiteResponse])
async def update_site(
    site_id: str, payload: SiteUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    site = await service.update_site(site_id, payload)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found for update")
    return ApiResponse(success=True, message="Site updated successfully", data=site)


@router.delete("/sites/{site_id}", response_model=ApiResponse[dict])
async def delete_site(site_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    success = await service.delete_site(site_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found for deletion")
    return ApiResponse(success=True, message="Site deleted successfully", data={"id": site_id})


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------
@router.get("/inventory", response_model=ApiResponse[List[InventoryResponse]])
async def list_inventory(
    site: Optional[str] = Query(None, description="Filter inventory by site name"),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    items = await service.list_inventory(site)
    return ApiResponse(success=True, message="Inventory retrieved successfully", data=items)


@router.get("/inventory/low-stock", response_model=ApiResponse[List[Dict[str, Any]]])
async def get_low_stock(
    site: Optional[str] = Query(None, description="Filter low stock by site name"),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    alerts = await service.get_low_stock(site)
    return ApiResponse(success=True, message="Low stock alerts retrieved", data=alerts)


@router.post("/inventory", response_model=ApiResponse[InventoryResponse], status_code=status.HTTP_201_CREATED)
async def create_inventory(
    payload: InventoryItemCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    item = await service.create_inventory_item(payload)
    return ApiResponse(success=True, message="Inventory item added", data=item)


@router.put("/inventory/{item_id}", response_model=ApiResponse[InventoryResponse])
async def update_inventory(
    item_id: str, payload: InventoryItemUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    item = await service.update_inventory_item(item_id, payload)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found for update")
    return ApiResponse(success=True, message="Inventory item updated", data=item)


@router.delete("/inventory/{item_id}", response_model=ApiResponse[dict])
async def delete_inventory(item_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    success = await service.delete_inventory_item(item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found for deletion")
    return ApiResponse(success=True, message="Inventory item deleted", data={"id": item_id})


# ---------------------------------------------------------------------------
# Stock In / Out
# ---------------------------------------------------------------------------
@router.post("/stock/in", response_model=ApiResponse[StockTransactionResponse], status_code=status.HTTP_201_CREATED)
async def stock_in(payload: StockInRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    tx = await service.record_stock_in(payload)
    return ApiResponse(success=True, message="Stock in recorded and inventory updated", data=tx)


@router.post("/stock/out", response_model=ApiResponse[StockTransactionResponse], status_code=status.HTTP_201_CREATED)
async def stock_out(payload: StockOutRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    tx = await service.record_stock_out(payload)
    return ApiResponse(success=True, message="Stock out recorded and inventory updated", data=tx)


@router.get("/stock/transactions", response_model=ApiResponse[List[StockTransactionResponse]])
async def list_stock_transactions(
    site: Optional[str] = Query(None), db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    txs = await service.list_transactions(site)
    return ApiResponse(success=True, message="Transactions retrieved", data=txs)


# ---------------------------------------------------------------------------
# Material Requests
# ---------------------------------------------------------------------------
@router.get("/requests", response_model=ApiResponse[List[MaterialRequestResponse]])
async def list_requests(
    site: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    reqs = await service.list_requests(site, status)
    return ApiResponse(success=True, message="Material requests retrieved", data=reqs)


@router.post("/requests", response_model=ApiResponse[MaterialRequestResponse], status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: MaterialRequestCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    req = await service.create_request(payload)
    return ApiResponse(success=True, message="Material request created", data=req)


@router.patch("/requests/{request_id}/status", response_model=ApiResponse[MaterialRequestResponse])
async def update_request_status(
    request_id: str, payload: RequestStatusUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    req = await service.update_request_status(request_id, payload.status)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return ApiResponse(success=True, message=f"Request status updated to {payload.status}", data=req)


@router.delete("/requests/{request_id}", response_model=ApiResponse[dict])
async def delete_request(request_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    success = await service.delete_request(request_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return ApiResponse(success=True, message="Request deleted", data={"id": request_id})


# ---------------------------------------------------------------------------
# Deliveries
# ---------------------------------------------------------------------------
@router.get("/deliveries", response_model=ApiResponse[List[DeliveryResponse]])
async def list_deliveries(
    site: Optional[str] = Query(None), db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    delivs = await service.list_deliveries(site)
    return ApiResponse(success=True, message="Deliveries retrieved", data=delivs)


@router.post("/deliveries", response_model=ApiResponse[DeliveryResponse], status_code=status.HTTP_201_CREATED)
async def create_delivery(
    payload: DeliveryCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    deliv = await service.create_delivery(payload)
    return ApiResponse(success=True, message="Delivery recorded", data=deliv)


@router.put("/deliveries/{delivery_id}", response_model=ApiResponse[DeliveryResponse])
async def update_delivery(
    delivery_id: str, payload: DeliveryUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    deliv = await service.update_delivery(delivery_id, payload)
    if not deliv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    return ApiResponse(success=True, message="Delivery updated", data=deliv)


@router.delete("/deliveries/{delivery_id}", response_model=ApiResponse[dict])
async def delete_delivery(delivery_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    success = await service.delete_delivery(delivery_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    return ApiResponse(success=True, message="Delivery deleted", data={"id": delivery_id})


# ---------------------------------------------------------------------------
# Photos
# ---------------------------------------------------------------------------
@router.get("/photos", response_model=ApiResponse[List[SitePhotoResponse]])
async def list_photos(
    site: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    photos = await service.list_photos(site, type)
    return ApiResponse(success=True, message="Photos retrieved", data=photos)


@router.post("/photos", response_model=ApiResponse[SitePhotoResponse], status_code=status.HTTP_201_CREATED)
async def add_photo(payload: SitePhotoCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    photo = await service.add_photo(payload)
    return ApiResponse(success=True, message="Photo uploaded successfully", data=photo)


@router.delete("/photos/{photo_id}", response_model=ApiResponse[dict])
async def delete_photo(photo_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    success = await service.delete_photo(photo_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    return ApiResponse(success=True, message="Photo deleted", data={"id": photo_id})


# ---------------------------------------------------------------------------
# Activities & Summary
# ---------------------------------------------------------------------------
@router.get("/activities", response_model=ApiResponse[List[ActivityResponse]])
async def list_activities(
    site: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    acts = await service.list_activities(site, limit)
    return ApiResponse(success=True, message="Activities retrieved", data=acts)


@router.get("/dashboard/summary", response_model=ApiResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    site: Optional[str] = Query(None), db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = ConstructionService(db)
    summary = await service.get_dashboard_summary(site)
    return ApiResponse(success=True, message="Dashboard summary retrieved", data=summary)


# ---------------------------------------------------------------------------
# Manual Seed
# ---------------------------------------------------------------------------
@router.post("/seed", response_model=ApiResponse[dict])
async def seed_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    await service.seed_database_if_empty()
    return ApiResponse(success=True, message="Database seeded with initial construction data", data={})
