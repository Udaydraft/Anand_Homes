import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import get_settings
from app.database.mongodb import get_database
from app.dependencies.auth import get_optional_user, require_admin

settings = get_settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = settings.UPLOAD_DIR
from app.models.user import UserModel
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


async def _resolve_allowed_sites(
    service: ConstructionService,
    current_user: Optional[UserModel],
) -> Optional[List[str]]:
    """Determine allowed site names for scoped access based on user role."""
    if current_user:
        if current_user.role == "supervisor":
            return await service.get_supervisor_site_names(current_user)
        elif current_user.role == "admin":
            return await service.get_admin_site_names(current_user)
    return None


# ---------------------------------------------------------------------------
# Sites
# ---------------------------------------------------------------------------
@router.get("/sites", response_model=ApiResponse[List[SiteResponse]])
async def list_sites(
    supervisor: Optional[str] = Query(None, description="Filter sites by supervisor name, email, or ID"),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    target_supervisor = supervisor
    supervisor_id = None
    supervisor_email = None
    admin_id = None
    admin_email = None

    if current_user:
        if current_user.role == "supervisor" and not target_supervisor:
            supervisor_id = str(current_user.id)
            supervisor_email = current_user.email
            target_supervisor = current_user.name
        elif current_user.role == "admin":
            admin_id = str(current_user.id)
            admin_email = current_user.email

    sites = await service.list_sites(
        supervisor=target_supervisor,
        supervisor_id=supervisor_id,
        supervisor_email=supervisor_email,
        admin_id=admin_id,
        admin_email=admin_email,
    )
    return ApiResponse(success=True, message="Sites retrieved successfully", data=sites)


@router.get("/sites/{site_id}", response_model=ApiResponse[SiteResponse])
async def get_site(site_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    site = await service.get_site(site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return ApiResponse(success=True, message="Site retrieved successfully", data=site)


@router.post("/sites", response_model=ApiResponse[SiteResponse], status_code=status.HTTP_201_CREATED)
async def create_site(
    payload: SiteCreate,
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    site = await service.create_site(payload, admin_user=current_user)
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
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    items = await service.list_inventory(site, allowed_sites=allowed_sites)
    return ApiResponse(success=True, message="Inventory retrieved successfully", data=items)


@router.get("/inventory/low-stock", response_model=ApiResponse[List[Dict[str, Any]]])
async def get_low_stock(
    site: Optional[str] = Query(None, description="Filter low stock by site name"),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    alerts = await service.get_low_stock(site, allowed_sites=allowed_sites)
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
    site: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    txs = await service.list_transactions(site, allowed_sites=allowed_sites)
    return ApiResponse(success=True, message="Transactions retrieved", data=txs)


# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Material Requests
# ---------------------------------------------------------------------------
@router.get("/requests", response_model=ApiResponse[List[MaterialRequestResponse]])
async def list_requests(
    site: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    reqs = await service.list_requests(site, status, allowed_sites=allowed_sites)
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
    site: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    delivs = await service.list_deliveries(site, allowed_sites=allowed_sites)
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
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    photos = await service.list_photos(site, type, allowed_sites=allowed_sites)
    return ApiResponse(success=True, message="Photos retrieved", data=photos)


@router.post("/photos/upload-file", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_photo_file(file: UploadFile = File(...)):
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".pdf"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(allowed_exts)}",
        )

    unique_name = f"site_upload_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = UPLOAD_DIR / unique_name

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write uploaded file: {exc}",
        )

    file_url = f"/uploads/{unique_name}"
    return ApiResponse(
        success=True,
        message="File uploaded successfully",
        data={"url": file_url, "filename": unique_name, "size": getattr(file, "size", None)},
    )


@router.post("/photos", response_model=ApiResponse[SitePhotoResponse], status_code=status.HTTP_201_CREATED)
async def add_photo(payload: SitePhotoCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    photo = await service.add_photo(payload)
    return ApiResponse(success=True, message="Photo uploaded successfully", data=photo)


@router.delete("/photos/{photo_id}", response_model=ApiResponse[dict])
async def delete_photo(
    photo_id: str,
    admin_user: Optional[UserModel] = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    success = await service.delete_photo(photo_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    return ApiResponse(success=True, message="Photo deleted", data={"id": photo_id})


# ---------------------------------------------------------------------------
# Real-Time Reports & Data Export
# ---------------------------------------------------------------------------
@router.get("/reports/{report_type}", response_model=ApiResponse[dict])
async def get_report_data(
    report_type: str,
    site: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    report_data = await service.generate_report(report_type, site=site, allowed_sites=allowed_sites)
    return ApiResponse(
        success=True,
        message=f"Report '{report_data.get('title', report_type)}' generated successfully",
        data=report_data,
    )


@router.get("/reports/{report_type}/download")
async def download_report_csv(
    report_type: str,
    site: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    csv_content = await service.generate_report_csv(report_type, site=site, allowed_sites=allowed_sites)
    clean_type = report_type.lower().replace("_", "-")
    timestamp = int(datetime.now().timestamp())
    filename = f"anand_homes_{clean_type}_{timestamp}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


# ---------------------------------------------------------------------------
# Activities & Summary
# ---------------------------------------------------------------------------
@router.get("/activities", response_model=ApiResponse[List[ActivityResponse]])
async def list_activities(
    site: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    acts = await service.list_activities(site, limit, allowed_sites=allowed_sites)
    return ApiResponse(success=True, message="Activities retrieved", data=acts)


@router.get("/dashboard/summary", response_model=ApiResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    site: Optional[str] = Query(None),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ConstructionService(db)
    allowed_sites = await _resolve_allowed_sites(service, current_user)
    admin_id = str(current_user.id) if current_user and current_user.role == "admin" else None
    admin_email = current_user.email if current_user and current_user.role == "admin" else None
    summary = await service.get_dashboard_summary(
        site,
        allowed_sites=allowed_sites,
        admin_id=admin_id,
        admin_email=admin_email,
    )
    return ApiResponse(success=True, message="Dashboard summary retrieved", data=summary)


# ---------------------------------------------------------------------------
# Manual Seed
# ---------------------------------------------------------------------------
@router.post("/seed", response_model=ApiResponse[dict])
async def seed_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    service = ConstructionService(db)
    await service.seed_database_if_empty()
    return ApiResponse(success=True, message="Database seeded with initial construction data", data={})
