import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class PropertyModel:
    """Represents a Real Estate Property in MongoDB."""

    def __init__(
        self,
        title: str,
        description: str,
        property_type: str,
        location: str,
        price: float,
        bedrooms: int = 2,
        bathrooms: int = 2,
        area_sqft: int = 1200,
        status: str = "available",
        featured: bool = False,
        image_url: str = "",
        gallery_images: Optional[List[str]] = None,
        amenities: Optional[List[str]] = None,
        site_id: Optional[str] = None,
        agent_name: str = "AnandHomes Sales Team",
        agent_contact: str = "+91 98765 43210",
        created_by: Optional[str] = None,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        self.id = id or f"PROP-{str(uuid.uuid4())[:8].upper()}"
        self.title = title
        self.description = description
        self.property_type = property_type
        self.location = location
        self.price = float(price)
        self.bedrooms = int(bedrooms)
        self.bathrooms = int(bathrooms)
        self.area_sqft = int(area_sqft)
        self.status = status
        self.featured = featured
        self.image_url = image_url
        self.gallery_images = gallery_images or []
        self.amenities = amenities or []
        self.site_id = site_id
        self.agent_name = agent_name
        self.agent_contact = agent_contact
        self.created_by = created_by
        now = datetime.now(timezone.utc)
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "propertyType": self.property_type,
            "location": self.location,
            "price": self.price,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "areaSqFt": self.area_sqft,
            "status": self.status,
            "featured": self.featured,
            "imageUrl": self.image_url,
            "galleryImages": self.gallery_images,
            "amenities": self.amenities,
            "siteId": self.site_id,
            "agentName": self.agent_name,
            "agentContact": self.agent_contact,
            "createdBy": self.created_by,
            "createdAt": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            "updatedAt": self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "PropertyModel":
        created = data.get("createdAt") or data.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                created = None
        updated = data.get("updatedAt") or data.get("updated_at")
        if isinstance(updated, str):
            try:
                updated = datetime.fromisoformat(updated)
            except Exception:
                updated = None

        return cls(
            id=str(data.get("id") or data.get("_id")),
            title=data.get("title", "Untitled Property"),
            description=data.get("description", ""),
            property_type=data.get("propertyType") or data.get("property_type", "Apartment"),
            location=data.get("location", "Chennai, TN"),
            price=float(data.get("price", 0)),
            bedrooms=int(data.get("bedrooms", 2)),
            bathrooms=int(data.get("bathrooms", 2)),
            area_sqft=int(data.get("areaSqFt") or data.get("area_sqft", 1000)),
            status=data.get("status", "available"),
            featured=bool(data.get("featured", False)),
            image_url=data.get("imageUrl") or data.get("image_url", ""),
            gallery_images=data.get("galleryImages") or data.get("gallery_images", []),
            amenities=data.get("amenities", []),
            site_id=data.get("siteId") or data.get("site_id"),
            agent_name=data.get("agentName") or data.get("agent_name", "AnandHomes Team"),
            agent_contact=data.get("agentContact") or data.get("agent_contact", "+91 98765 43210"),
            created_at=created,
            updated_at=updated,
        )


class FavoriteModel:
    """Represents a User's favorite property in MongoDB."""

    def __init__(
        self,
        user_id: str,
        property_id: str,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ) -> None:
        self.id = id or f"FAV-{str(uuid.uuid4())[:8].upper()}"
        self.user_id = user_id
        self.property_id = property_id
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "userId": self.user_id,
            "propertyId": self.property_id,
            "createdAt": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "FavoriteModel":
        created = data.get("createdAt") or data.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                created = None

        return cls(
            id=str(data.get("id") or data.get("_id")),
            user_id=str(data.get("userId") or data.get("user_id")),
            property_id=str(data.get("propertyId") or data.get("property_id")),
            created_at=created,
        )


class EnquiryModel:
    """Represents a Client Enquiry submitted for a Property in MongoDB."""

    def __init__(
        self,
        property_id: str,
        property_title: str,
        user_id: str,
        user_name: str,
        user_email: str,
        user_phone: str,
        message: str,
        status: str = "new",
        agent_notes: str = "",
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ) -> None:
        self.id = id or f"ENQ-{str(uuid.uuid4())[:8].upper()}"
        self.property_id = property_id
        self.property_title = property_title
        self.user_id = user_id
        self.user_name = user_name
        self.user_email = user_email
        self.user_phone = user_phone
        self.message = message
        self.status = status
        self.agent_notes = agent_notes
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "propertyId": self.property_id,
            "propertyTitle": self.property_title,
            "userId": self.user_id,
            "userName": self.user_name,
            "userEmail": self.user_email,
            "userPhone": self.user_phone,
            "message": self.message,
            "status": self.status,
            "agentNotes": self.agent_notes,
            "createdAt": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "EnquiryModel":
        created = data.get("createdAt") or data.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                created = None

        return cls(
            id=str(data.get("id") or data.get("_id")),
            property_id=str(data.get("propertyId") or data.get("property_id")),
            property_title=data.get("propertyTitle") or data.get("property_title", "General Enquiry"),
            user_id=str(data.get("userId") or data.get("user_id")),
            user_name=data.get("userName") or data.get("user_name", "Prospective Buyer"),
            user_email=data.get("userEmail") or data.get("user_email", ""),
            user_phone=data.get("userPhone") or data.get("user_phone", ""),
            message=data.get("message", ""),
            status=data.get("status", "new"),
            agent_notes=data.get("agentNotes") or data.get("agent_notes", ""),
            created_at=created,
        )


class NotificationModel:
    """Represents a system or client notification in MongoDB."""

    def __init__(
        self,
        title: str,
        message: str,
        type: str = "info",
        is_read: bool = False,
        user_id: Optional[str] = None,
        link: Optional[str] = None,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ) -> None:
        self.id = id or f"NOTIF-{str(uuid.uuid4())[:8].upper()}"
        self.title = title
        self.message = message
        self.type = type
        self.is_read = is_read
        self.user_id = user_id
        self.link = link
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "_id": self.id,
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "isRead": self.is_read,
            "userId": self.user_id,
            "link": self.link,
            "createdAt": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "NotificationModel":
        created = data.get("createdAt") or data.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                created = None

        return cls(
            id=str(data.get("id") or data.get("_id")),
            title=data.get("title", ""),
            message=data.get("message", ""),
            type=data.get("type", "info"),
            is_read=bool(data.get("isRead") or data.get("is_read", False)),
            user_id=data.get("userId") or data.get("user_id"),
            link=data.get("link"),
            created_at=created,
        )
