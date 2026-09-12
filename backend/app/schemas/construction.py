from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Site Schemas
# ---------------------------------------------------------------------------
class SiteBase(BaseModel):
    code: str = Field(..., examples=["RBL-S-001"])
    name: str = Field(..., examples=["Site Alpha"])
    location: str = Field(..., examples=["Chennai, TN"])
    supervisor: str = Field(..., examples=["Rajesh Kumar"])
    supervisorId: Optional[str] = None
    supervisorEmail: Optional[str] = None
    status: Literal["Active", "Inactive"] = "Active"
    totalMaterials: int = 0
    stockValue: float = 0.0
    stockValueFormatted: str = "₹0"
    imageUrl: Optional[str] = None
    startDate: Optional[str] = None
    contact: Optional[str] = None
    projectType: Optional[str] = None


class SiteCreate(SiteBase):
    pass


class SiteUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    supervisor: Optional[str] = None
    supervisorId: Optional[str] = None
    supervisorEmail: Optional[str] = None
    status: Optional[Literal["Active", "Inactive"]] = None
    totalMaterials: Optional[int] = None
    stockValue: Optional[float] = None
    stockValueFormatted: Optional[str] = None
    imageUrl: Optional[str] = None
    startDate: Optional[str] = None
    contact: Optional[str] = None
    projectType: Optional[str] = None


class SiteResponse(SiteBase):
    id: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Inventory Schemas
# ---------------------------------------------------------------------------
StockStatusType = Literal["Good", "Medium", "Low", "Out of Stock"]
CategoryType = Literal["Cement", "Steel", "Aggregate", "Masonry", "Finishing", "Others"]


class InventoryItemBase(BaseModel):
    name: str = Field(..., examples=["UltraTech PPC Cement"])
    category: CategoryType = "Cement"
    unit: str = Field(..., examples=["Bags"])
    totalStock: float = 0.0
    minStock: float = 0.0
    status: StockStatusType = "Good"
    site: str = Field(..., examples=["Site Alpha"])


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[CategoryType] = None
    unit: Optional[str] = None
    totalStock: Optional[float] = None
    minStock: Optional[float] = None
    status: Optional[StockStatusType] = None
    site: Optional[str] = None


class InventoryResponse(InventoryItemBase):
    id: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Stock Transactions (Stock In / Stock Out)
# ---------------------------------------------------------------------------
class StockInRequest(BaseModel):
    site: str
    material: str
    quantity: float
    unit: str
    supplier: str
    invoiceNo: str
    deliveryDate: str
    notes: Optional[str] = None


class StockOutRequest(BaseModel):
    site: str
    material: str
    quantity: float
    unit: str
    usedFor: str
    requestedBy: str
    notes: Optional[str] = None


class StockTransactionResponse(BaseModel):
    id: str
    site: str
    material: str
    quantity: float
    unit: str
    type: Literal["stock_in", "stock_out"]
    reference: str  # invoiceNo or usedFor
    actor: str      # supplier or requestedBy
    timestamp: str
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Material Requests
# ---------------------------------------------------------------------------
RequestStatus = Literal["Pending", "Approved", "Rejected"]


class MaterialRequestCreate(BaseModel):
    site: str
    material: str
    quantity: float
    unit: str
    requestedBy: str = "Site Supervisor"
    requiredDate: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    attachments: Optional[str] = None


class RequestStatusUpdate(BaseModel):
    status: RequestStatus


class MaterialRequestResponse(BaseModel):
    id: str
    requestId: str
    site: str
    material: str
    quantity: float
    unit: str
    requestedBy: str
    requestedOn: str
    requiredDate: Optional[str] = None
    purpose: Optional[str] = None
    status: RequestStatus
    notes: Optional[str] = None
    attachments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Deliveries
# ---------------------------------------------------------------------------
DeliveryStatus = Literal["Expected", "In Transit", "Received", "Cancelled"]


class DeliveryCreate(BaseModel):
    deliveryId: Optional[str] = None
    supplier: str
    site: str
    material: str
    expectedQty: float
    receivedQty: float = 0.0
    unit: str
    status: DeliveryStatus = "Expected"
    expectedDate: Optional[str] = None
    receivedOn: Optional[str] = None
    invoiceNo: Optional[str] = None
    receivedBy: Optional[str] = None
    shortage: Optional[str] = None


class DeliveryUpdate(BaseModel):
    supplier: Optional[str] = None
    site: Optional[str] = None
    material: Optional[str] = None
    expectedQty: Optional[float] = None
    receivedQty: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[DeliveryStatus] = None
    expectedDate: Optional[str] = None
    receivedOn: Optional[str] = None
    invoiceNo: Optional[str] = None
    receivedBy: Optional[str] = None
    shortage: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: str
    deliveryId: str
    supplier: str
    site: str
    material: str
    expectedQty: float
    receivedQty: float
    unit: str
    status: DeliveryStatus
    expectedDate: Optional[str] = None
    receivedOn: Optional[str] = None
    invoiceNo: Optional[str] = None
    receivedBy: Optional[str] = None
    shortage: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Site Photos
# ---------------------------------------------------------------------------
PhotoType = Literal["Stock In", "Stock Out", "Site Progress"]


class SitePhotoCreate(BaseModel):
    title: str
    site: str
    type: PhotoType = "Site Progress"
    imageUrl: str
    uploader: Optional[str] = "Site Engineer"


class SitePhotoResponse(BaseModel):
    id: str
    title: str
    site: str
    type: PhotoType
    timestamp: str
    imageUrl: str
    uploader: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Activity & Dashboard Summary
# ---------------------------------------------------------------------------
class ActivityResponse(BaseModel):
    id: str
    text: str
    subtext: Optional[str] = None
    site: str
    time: str
    type: Literal["stock_in", "stock_out", "request", "delivery", "photo"]

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class DashboardSummaryResponse(BaseModel):
    totalSites: int
    activeSites: int
    totalInventoryValue: float
    formattedInventoryValue: str
    totalMaterials: int
    pendingRequestsCount: int
    activeDeliveriesCount: int
    lowStockCount: int
    criticalAlertsCount: int
