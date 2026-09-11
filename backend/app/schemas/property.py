from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


def format_inr(val: float) -> str:
    """Format numeric INR into Indian numbering representation."""
    if val >= 10000000:
        return f"₹{val / 10000000:.2f} Cr"
    elif val >= 100000:
        return f"₹{val / 100000:.1f} Lakh"
    return f"₹{val:,.0f}"


class PropertyBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field("", max_length=2000)
    propertyType: str = Field("Apartment", description="Apartment, Villa, Plot, Commercial")
    location: str = Field(..., min_length=2, max_length=150)
    price: float = Field(..., ge=0)
    bedrooms: int = Field(2, ge=0, le=20)
    bathrooms: int = Field(2, ge=0, le=20)
    areaSqFt: int = Field(1000, ge=50)
    status: str = Field("available", description="available, booked, sold")
    featured: bool = Field(False)
    imageUrl: str = Field("")
    galleryImages: List[str] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)
    siteId: Optional[str] = None
    agentName: str = Field("AnandHomes Sales Team")
    agentContact: str = Field("+91 98765 43210")


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    propertyType: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    areaSqFt: Optional[int] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    imageUrl: Optional[str] = None
    galleryImages: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    siteId: Optional[str] = None
    agentName: Optional[str] = None
    agentContact: Optional[str] = None


class PropertyResponse(PropertyBase):
    id: str
    priceFormatted: str = ""
    createdAt: str
    updatedAt: Optional[str] = None
    isFavorite: bool = False

    model_config = ConfigDict(from_attributes=True)


class FavoriteResponse(BaseModel):
    id: str
    userId: str
    propertyId: str
    createdAt: str
    property: Optional[PropertyResponse] = None

    model_config = ConfigDict(from_attributes=True)


class EnquiryCreate(BaseModel):
    propertyId: str = Field(..., min_length=1)
    message: str = Field(..., min_length=3, max_length=1000)
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None


class EnquiryStatusUpdate(BaseModel):
    status: str = Field(..., description="new, in_progress, contacted, closed")
    agentNotes: Optional[str] = None


class EnquiryResponse(BaseModel):
    id: str
    propertyId: str
    propertyTitle: str
    userId: str
    userName: str
    userEmail: str
    userPhone: str
    message: str
    status: str
    agentNotes: Optional[str] = ""
    createdAt: str

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str = "info"
    isRead: bool = False
    link: Optional[str] = None
    createdAt: str

    model_config = ConfigDict(from_attributes=True)


class DashboardUserSummary(BaseModel):
    name: str
    email: str
    role: str


class DashboardDataResponse(BaseModel):
    userSummary: DashboardUserSummary
    propertiesCount: int
    favoritesCount: int
    enquiriesCount: int
    activeSitesCount: int
    totalStockValueFormatted: str
    recentEnquiries: List[EnquiryResponse]
    featuredProperties: List[PropertyResponse]
    notifications: List[NotificationResponse]

    model_config = ConfigDict(from_attributes=True)
