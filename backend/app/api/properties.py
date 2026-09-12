import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user, get_optional_user, require_roles
from app.models.user import UserModel
from app.schemas.property import (
    DashboardDataResponse,
    EnquiryCreate,
    EnquiryResponse,
    EnquiryStatusUpdate,
    FavoriteResponse,
    NotificationResponse,
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
)
from app.schemas.user import ApiResponse
from app.services.property_service import PropertyService

logger = logging.getLogger("app.api.properties")
router = APIRouter(tags=["Properties & Real Estate"])


# ---------------------------------------------------------------------------
# Properties Endpoints
# ---------------------------------------------------------------------------
@router.get("/properties", response_model=ApiResponse[List[PropertyResponse]])
async def list_properties(
    search: Optional[str] = Query(None, description="Search keyword in title, location, description"),
    location: Optional[str] = Query(None, description="Filter by location city or zone"),
    propertyType: Optional[str] = Query(None, description="Apartment, Villa, Plot, Commercial"),
    minPrice: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    maxPrice: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    bedrooms: Optional[str] = Query(None, description="Bedrooms count filter"),
    status: Optional[str] = Query(None, description="available, booked, sold"),
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[List[PropertyResponse]]:
    service = PropertyService(db)
    user_id = str(current_user.id) if current_user else None
    parsed_beds = int(bedrooms) if bedrooms and bedrooms.isdigit() else None
    props = await service.list_properties(
        search=search,
        location=location,
        property_type=propertyType,
        min_price=minPrice,
        max_price=maxPrice,
        bedrooms=parsed_beds,
        status=status,
        current_user_id=user_id,
    )
    return ApiResponse(success=True, message="Properties retrieved successfully", data=props)


@router.get("/properties/{property_id}", response_model=ApiResponse[PropertyResponse])
async def get_property(
    property_id: str,
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[PropertyResponse]:
    service = PropertyService(db)
    user_id = str(current_user.id) if current_user else None
    prop = await service.get_property(property_id, current_user_id=user_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return ApiResponse(success=True, message="Property details retrieved", data=prop)


@router.post(
    "/properties",
    response_model=ApiResponse[PropertyResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_property(
    payload: PropertyCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[PropertyResponse]:
    service = PropertyService(db)
    prop = await service.create_property(payload, current_user=current_user)
    return ApiResponse(success=True, message="Property created successfully", data=prop)


@router.put("/properties/{property_id}", response_model=ApiResponse[PropertyResponse])
async def update_property(
    property_id: str,
    payload: PropertyUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[PropertyResponse]:
    service = PropertyService(db)
    prop = await service.update_property(property_id, payload)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found for update")
    return ApiResponse(success=True, message="Property updated successfully", data=prop)


@router.delete("/properties/{property_id}", response_model=ApiResponse[dict])
async def delete_property(
    property_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[dict]:
    service = PropertyService(db)
    success = await service.delete_property(property_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found for deletion")
    return ApiResponse(success=True, message="Property deleted successfully", data={"id": property_id})


# ---------------------------------------------------------------------------
# Favorites Endpoints
# ---------------------------------------------------------------------------
@router.post("/properties/{property_id}/favorite", response_model=ApiResponse[dict])
async def toggle_favorite(
    property_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[dict]:
    service = PropertyService(db)
    result = await service.toggle_favorite(str(current_user.id), property_id)
    action = "added to" if result.get("favorited") else "removed from"
    return ApiResponse(
        success=True,
        message=f"Property {action} favorites",
        data=result,
    )


@router.delete("/properties/{property_id}/favorite", response_model=ApiResponse[dict])
async def remove_favorite(
    property_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[dict]:
    service = PropertyService(db)
    removed = await service.remove_favorite(str(current_user.id), property_id)
    return ApiResponse(
        success=True,
        message="Property removed from favorites",
        data={"favorited": False, "propertyId": property_id, "removed": removed},
    )


@router.get("/favorites", response_model=ApiResponse[List[PropertyResponse]])
async def list_favorites(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[List[PropertyResponse]]:
    service = PropertyService(db)
    favs = await service.list_favorites(str(current_user.id))
    return ApiResponse(success=True, message="Favorites retrieved successfully", data=favs)


# ---------------------------------------------------------------------------
# Enquiries Endpoints
# ---------------------------------------------------------------------------
@router.post(
    "/enquiries",
    response_model=ApiResponse[EnquiryResponse],
    status_code=status.HTTP_201_CREATED,
)
async def submit_enquiry(
    payload: EnquiryCreate,
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[EnquiryResponse]:
    service = PropertyService(db)
    # If unauthenticated, use guest placeholder
    user = current_user or UserModel(
        name=payload.name or "Guest Buyer",
        email=payload.email or "guest@anandhomes.com",
        password_hash="",
    )
    enq = await service.create_enquiry(payload, user)
    return ApiResponse(success=True, message="Enquiry submitted successfully", data=enq)


@router.post(
    "/properties/{property_id}/enquiry",
    response_model=ApiResponse[EnquiryResponse],
    status_code=status.HTTP_201_CREATED,
)
async def submit_property_enquiry(
    property_id: str,
    payload: EnquiryCreate,
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[EnquiryResponse]:
    payload.propertyId = property_id
    service = PropertyService(db)
    user = current_user or UserModel(
        name=payload.name or "Guest Buyer",
        email=payload.email or "guest@anandhomes.com",
        password_hash="",
    )
    enq = await service.create_enquiry(payload, user)
    return ApiResponse(success=True, message="Enquiry submitted successfully", data=enq)


@router.get("/enquiries", response_model=ApiResponse[List[EnquiryResponse]])
async def list_enquiries(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[List[EnquiryResponse]]:
    service = PropertyService(db)
    is_admin = current_user.role in ["admin", "agent", "supervisor"]
    enqs = await service.list_enquiries(
        user_id=str(current_user.id),
        is_admin=is_admin,
        user_email=current_user.email,
    )
    return ApiResponse(success=True, message="Enquiries retrieved successfully", data=enqs)


@router.patch("/enquiries/{enquiry_id}/status", response_model=ApiResponse[EnquiryResponse])
async def update_enquiry_status(
    enquiry_id: str,
    payload: EnquiryStatusUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[EnquiryResponse]:
    service = PropertyService(db)
    enq = await service.update_enquiry_status(enquiry_id, payload.status, payload.agentNotes)
    if not enq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")
    return ApiResponse(success=True, message=f"Enquiry marked as {payload.status}", data=enq)


# ---------------------------------------------------------------------------
# Unified Dashboard & Notifications
# ---------------------------------------------------------------------------
@router.get("/dashboard", response_model=ApiResponse[DashboardDataResponse])
async def get_dashboard(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[DashboardDataResponse]:
    service = PropertyService(db)
    data = await service.get_dashboard_data(current_user)
    return ApiResponse(success=True, message="Dashboard data retrieved successfully", data=data)


@router.get("/notifications", response_model=ApiResponse[List[NotificationResponse]])
async def list_notifications(
    current_user: Optional[UserModel] = Depends(get_optional_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[List[NotificationResponse]]:
    service = PropertyService(db)
    user_id = str(current_user.id) if current_user else None
    notifs = await service.list_notifications(user_id)
    return ApiResponse(success=True, message="Notifications retrieved", data=notifs)
