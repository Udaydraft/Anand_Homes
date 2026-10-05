from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Site Schemas
# ---------------------------------------------------------------------------
class SiteBase(BaseModel):
    code: Optional[str] = "SITE-001"
    name: str = Field(..., examples=["Site Alpha"])
    location: Optional[str] = "On-site"
    supervisor: Optional[str] = "Unassigned"
    supervisorId: Optional[str] = None
    supervisorEmail: Optional[str] = None
    adminId: Optional[str] = None
    adminEmail: Optional[str] = None
    createdBy: Optional[str] = None
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
    adminId: Optional[str] = None
    adminEmail: Optional[str] = None
    createdBy: Optional[str] = None
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
CategoryType = str


class InventoryItemBase(BaseModel):
    name: str = Field(..., examples=["UltraTech PPC Cement"])
    category: CategoryType = "Cement"
    unit: str = Field(..., examples=["Bags"])
    totalStock: float = 0.0
    minStock: float = 0.0
    status: StockStatusType = "Good"
    site: str = Field(..., examples=["Site Alpha"])
    unitPrice: Optional[float] = Field(0.0, examples=[350.0])


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
    urgency: Optional[str] = "Normal"
    requestedBy: str = "Site Supervisor"
    requiredDate: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    attachments: Optional[str] = None


class RequestStatusUpdate(BaseModel):
    status: RequestStatus


class SendMaterialsRequest(BaseModel):
    quantity: Optional[float] = None
    notes: Optional[str] = None
    supplierOrStore: Optional[str] = "Central Warehouse / Admin"
    addStockQuantity: Optional[float] = None
    supplier: Optional[str] = None
    invoiceNo: Optional[str] = None
    unitPrice: Optional[float] = None


class MaterialRequestResponse(BaseModel):
    id: str
    requestId: str
    site: str
    material: str
    quantity: float
    unit: str
    urgency: Optional[str] = "Normal"
    requestedBy: str
    requestedOn: str
    requiredDate: Optional[str] = None
    purpose: Optional[str] = None
    status: RequestStatus
    notes: Optional[str] = None
    attachments: Optional[str] = None
    dispatchedQty: Optional[float] = None
    dispatchedOn: Optional[str] = None
    dispatchedBy: Optional[str] = None
    dispatchNotes: Optional[str] = None

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
    type: str = "request"
    actor: Optional[str] = None
    targetRole: Optional[str] = None
    words: Optional[str] = None
    status: Optional[str] = "unread"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ActivityCreate(BaseModel):
    text: str
    site: str
    type: Optional[str] = "request"
    subtext: Optional[str] = None
    actor: Optional[str] = None
    targetRole: Optional[str] = None
    words: Optional[str] = None


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


# ---------------------------------------------------------------------------
# Key Screens Schemas (Project Master, Supervisor Master, Project Duration, etc.)
# ---------------------------------------------------------------------------

class ProjectMasterCreate(BaseModel):
    projectName: str = Field(..., examples=["Metro Building"])
    siteName: str = Field(..., examples=["Site A"])
    status: Optional[str] = "Active"


class ProjectMasterUpdate(BaseModel):
    projectName: Optional[str] = None
    siteName: Optional[str] = None
    status: Optional[str] = None


class ProjectMasterResponse(BaseModel):
    id: str
    projectName: str
    siteName: str
    createdOn: str
    status: str = "Active"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SupervisorMasterCreate(BaseModel):
    name: str = Field(..., examples=["Ramesh Kumar"])
    loginId: str = Field(..., examples=["ramesh"])
    password: str = Field(..., examples=["password123"])
    project: str = Field(..., examples=["Metro Building"])
    site: str = Field(..., examples=["Site A"])


class SupervisorMasterUpdate(BaseModel):
    name: Optional[str] = None
    loginId: Optional[str] = None
    password: Optional[str] = None
    project: Optional[str] = None
    site: Optional[str] = None


class SupervisorMasterResponse(BaseModel):
    id: str
    name: str
    loginId: str
    project: str
    site: str
    createdOn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ProjectDurationCreate(BaseModel):
    projectName: str = Field(..., examples=["Metro Building"])
    siteName: str = Field(..., examples=["Site A"])
    fromDate: str = Field(..., examples=["10-08-2025"])
    toDate: str = Field(..., examples=["15-08-2026"])


class ProjectDurationResponse(BaseModel):
    id: str
    projectName: str
    siteName: str
    fromDate: str
    toDate: str
    createdOn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class InventoryMasterCreate(BaseModel):
    category: str = Field(..., examples=["Cement"])
    material: str = Field(..., examples=["UltraTech PPC"])
    measurement: str = Field(..., examples=["Bags"])
    materialType: Optional[Literal["Prime", "Other"]] = "Prime"
    natureOfWork: Optional[List[str]] = ["Construction", "Installation"]
    initialStock: Optional[float] = 0.0
    minStock: Optional[float] = 10.0
    site: Optional[str] = None


class InventoryMasterUpdate(BaseModel):
    category: Optional[str] = None
    material: Optional[str] = None
    measurement: Optional[str] = None
    materialType: Optional[Literal["Prime", "Other"]] = None
    natureOfWork: Optional[List[str]] = None
    initialStock: Optional[float] = None
    minStock: Optional[float] = None
    site: Optional[str] = None


class InventoryMasterResponse(BaseModel):
    id: str
    category: str
    material: str
    measurement: str
    materialType: str = "Prime"
    natureOfWork: List[str] = []
    createdOn: Optional[str] = None
    initialStock: Optional[float] = 0.0
    minStock: Optional[float] = 10.0
    site: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class InwardMaterialCreate(BaseModel):
    date: str = Field(..., examples=["10-08-2025"])
    site: Optional[str] = Field(None, examples=["Site A"])
    project: Optional[str] = Field(None, examples=["ACB Building"])
    category: str = Field(..., examples=["Cement"])
    material: str = Field(..., examples=["UltraTech PPC"])
    quantity: float = Field(..., gt=0, examples=[100.0])
    measurement: str = Field(..., examples=["Bags"])
    totalValue: Optional[float] = Field(0.0, examples=[35000.0])


class InwardMaterialResponse(BaseModel):
    id: str
    entryCode: str
    date: str
    site: Optional[str] = None
    project: Optional[str] = None
    category: str
    material: str
    quantity: float
    measurement: str
    totalValue: float
    unitPrice: float
    createdOn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class OutwardMaterialCreate(BaseModel):
    date: str = Field(..., examples=["10-08-2025"])
    project: str = Field(..., examples=["Metro Building"])
    site: str = Field(..., examples=["Site A"])
    material: Optional[str] = Field(None, examples=["UltraTech PPC"])
    natureOfWork: str = Field(..., examples=["Construction"])
    quantity: float = Field(..., gt=0, examples=[25.0])
    measurement: str = Field(..., examples=["Bags"])
    outwardId: Optional[str] = None
    notes: Optional[str] = None


class OutwardMaterialResponse(BaseModel):
    id: str
    outwardId: Optional[str] = None
    date: str
    project: str
    site: str
    material: Optional[str] = None
    natureOfWork: str
    quantity: float
    measurement: str
    notes: Optional[str] = None
    createdOn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class LabourEntryCreate(BaseModel):
    date: str = Field(..., examples=["10-08-2025"])
    project: str = Field(..., examples=["Metro Building"])
    site: str = Field(..., examples=["Site A"])
    natureOfWork: str = Field(..., examples=["Construction"])
    type: Literal["Count (Labour)", "Other"] = "Count (Labour)"
    workerCount: int = Field(..., gt=0, examples=[15])


class LabourEntryResponse(BaseModel):
    id: str
    date: str
    project: str
    site: str
    natureOfWork: str
    type: str
    workerCount: int
    createdOn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
