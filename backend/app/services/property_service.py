import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.property import (
    EnquiryModel,
    FavoriteModel,
    NotificationModel,
    PropertyModel,
)
from app.schemas.property import (
    DashboardDataResponse,
    DashboardUserSummary,
    EnquiryCreate,
    EnquiryResponse,
    FavoriteResponse,
    NotificationResponse,
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
    format_inr,
)

logger = logging.getLogger("app.services.property")


class PropertyService:
    """Manages Properties, Favorites, Enquiries, Notifications, and Dashboard."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.properties = db["properties"]
        self.favorites = db["favorites"]
        self.enquiries = db["enquiries"]
        self.notifications = db["notifications"]
        self.sites = db["sites"]

    def _to_property_response(self, prop: Dict[str, Any], is_fav: bool = False) -> PropertyResponse:
        price = float(prop.get("price", 0))
        return PropertyResponse(
            id=str(prop.get("id") or prop.get("_id")),
            title=prop.get("title", ""),
            description=prop.get("description", ""),
            propertyType=prop.get("propertyType", "Apartment"),
            location=prop.get("location", ""),
            price=price,
            priceFormatted=format_inr(price),
            bedrooms=int(prop.get("bedrooms", 2)),
            bathrooms=int(prop.get("bathrooms", 2)),
            areaSqFt=int(prop.get("areaSqFt", 1000)),
            status=prop.get("status", "available"),
            featured=bool(prop.get("featured", False)),
            imageUrl=prop.get("imageUrl", ""),
            galleryImages=prop.get("galleryImages", []),
            amenities=prop.get("amenities", []),
            siteId=prop.get("siteId"),
            agentName=prop.get("agentName", "AnandHomes Sales Team"),
            agentContact=prop.get("agentContact", "+91 98765 43210"),
            createdAt=str(prop.get("createdAt", "")),
            updatedAt=str(prop.get("updatedAt", "")),
            isFavorite=is_fav,
        )

    async def list_properties(
        self,
        search: Optional[str] = None,
        location: Optional[str] = None,
        property_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        status: Optional[str] = None,
        current_user_id: Optional[str] = None,
    ) -> List[PropertyResponse]:
        query: Dict[str, Any] = {}

        if search:
            escaped = re.escape(search.strip())
            regex = {"$regex": escaped, "$options": "i"}
            query["$or"] = [
                {"title": regex},
                {"location": regex},
                {"description": regex},
                {"propertyType": regex},
            ]

        if location and location != "All":
            query["location"] = {"$regex": re.escape(location), "$options": "i"}

        if property_type and property_type != "All":
            query["propertyType"] = property_type

        if bedrooms is not None and str(bedrooms) != "All":
            query["bedrooms"] = int(bedrooms)

        if status and status != "All":
            query["status"] = status

        price_query: Dict[str, Any] = {}
        if min_price is not None and min_price > 0:
            price_query["$gte"] = float(min_price)
        if max_price is not None and max_price > 0:
            price_query["$lte"] = float(max_price)
        if price_query:
            query["price"] = price_query

        cursor = self.properties.find(query).sort("createdAt", -1)
        raw_props = await cursor.to_list(length=100)

        # Retrieve user favorites if logged in
        fav_prop_ids = set()
        if current_user_id:
            fav_cursor = self.favorites.find({"userId": current_user_id})
            fav_docs = await fav_cursor.to_list(length=200)
            fav_prop_ids = {str(d.get("propertyId")) for d in fav_docs}

        return [
            self._to_property_response(p, str(p.get("id") or p.get("_id")) in fav_prop_ids)
            for p in raw_props
        ]

    async def get_property(
        self, property_id: str, current_user_id: Optional[str] = None
    ) -> Optional[PropertyResponse]:
        doc = await self.properties.find_one({"$or": [{"id": property_id}, {"_id": property_id}]})
        if not doc:
            return None

        is_fav = False
        if current_user_id:
            fav = await self.favorites.find_one({"userId": current_user_id, "propertyId": property_id})
            is_fav = fav is not None

        return self._to_property_response(doc, is_fav)

    async def create_property(self, payload: PropertyCreate) -> PropertyResponse:
        model = PropertyModel(
            title=payload.title,
            description=payload.description,
            property_type=payload.propertyType,
            location=payload.location,
            price=payload.price,
            bedrooms=payload.bedrooms,
            bathrooms=payload.bathrooms,
            area_sqft=payload.areaSqFt,
            status=payload.status,
            featured=payload.featured,
            image_url=payload.imageUrl,
            gallery_images=payload.galleryImages,
            amenities=payload.amenities,
            site_id=payload.siteId,
            agent_name=payload.agentName,
            agent_contact=payload.agentContact,
        )
        doc = model.to_dict()
        await self.properties.insert_one(doc)
        logger.info("Created property: id=%s title=%s", model.id, model.title)
        return self._to_property_response(doc, False)

    async def update_property(
        self, property_id: str, payload: PropertyUpdate
    ) -> Optional[PropertyResponse]:
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_property(property_id)

        update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        res = await self.properties.find_one_and_update(
            {"$or": [{"id": property_id}, {"_id": property_id}]},
            {"$set": update_data},
            return_document=True,
        )
        if not res:
            return None
        return self._to_property_response(res)

    async def delete_property(self, property_id: str) -> bool:
        res = await self.properties.delete_one({"$or": [{"id": property_id}, {"_id": property_id}]})
        if res.deleted_count > 0:
            # Also clean up favorites and enquiries
            await self.favorites.delete_many({"propertyId": property_id})
            return True
        return False

    # ---------------------------------------------------------------------------
    # Favorites
    # ---------------------------------------------------------------------------
    async def toggle_favorite(self, user_id: str, property_id: str) -> Dict[str, Any]:
        existing = await self.favorites.find_one({"userId": user_id, "propertyId": property_id})
        if existing:
            await self.favorites.delete_one({"_id": existing["_id"]})
            logger.info("Removed favorite: user=%s property=%s", user_id, property_id)
            return {"favorited": False, "propertyId": property_id}
        else:
            model = FavoriteModel(user_id=user_id, property_id=property_id)
            await self.favorites.insert_one(model.to_dict())
            logger.info("Added favorite: user=%s property=%s", user_id, property_id)
            return {"favorited": True, "propertyId": property_id}

    async def remove_favorite(self, user_id: str, property_id: str) -> bool:
        res = await self.favorites.delete_one({"userId": user_id, "propertyId": property_id})
        return res.deleted_count > 0

    async def list_favorites(self, user_id: str) -> List[PropertyResponse]:
        cursor = self.favorites.find({"userId": user_id}).sort("createdAt", -1)
        fav_docs = await cursor.to_list(length=100)
        if not fav_docs:
            return []

        prop_ids = [d["propertyId"] for d in fav_docs]
        prop_cursor = self.properties.find({"$or": [{"id": {"$in": prop_ids}}, {"_id": {"$in": prop_ids}}]})
        raw_props = await prop_cursor.to_list(length=100)
        prop_map = {str(p.get("id") or p.get("_id")): p for p in raw_props}

        result = []
        for d in fav_docs:
            p_id = d["propertyId"]
            if p_id in prop_map:
                result.append(self._to_property_response(prop_map[p_id], is_fav=True))
        return result

    # ---------------------------------------------------------------------------
    # Enquiries
    # ---------------------------------------------------------------------------
    async def create_enquiry(self, payload: EnquiryCreate, user: Any) -> EnquiryResponse:
        prop = await self.properties.find_one({"$or": [{"id": payload.propertyId}, {"_id": payload.propertyId}]})
        prop_title = prop.get("title", "Property") if prop else "Property Enquiry"

        user_id = str(user.id)
        user_name = payload.name or getattr(user, "name", "Prospective Buyer")
        user_email = payload.email or getattr(user, "email", "")
        user_phone = payload.phone or "+91 98765 00000"

        model = EnquiryModel(
            property_id=payload.propertyId,
            property_title=prop_title,
            user_id=user_id,
            user_name=user_name,
            user_email=user_email,
            user_phone=user_phone,
            message=payload.message,
        )
        doc = model.to_dict()
        await self.enquiries.insert_one(doc)
        logger.info("Enquiry submitted: id=%s user=%s property=%s", model.id, user_id, payload.propertyId)

        # Generate notification for sales/agent
        notif = NotificationModel(
            title="New Property Enquiry",
            message=f"{user_name} enquired about '{prop_title}'.",
            type="info",
            link="/enquiries",
        )
        await self.notifications.insert_one(notif.to_dict())

        return EnquiryResponse(
            id=model.id,
            propertyId=model.property_id,
            propertyTitle=model.property_title,
            userId=model.user_id,
            userName=model.user_name,
            userEmail=model.user_email,
            userPhone=model.user_phone,
            message=model.message,
            status=model.status,
            agentNotes=model.agent_notes,
            createdAt=model.created_at.isoformat(),
        )

    async def list_enquiries(
        self, user_id: Optional[str] = None, is_admin: bool = False
    ) -> List[EnquiryResponse]:
        query = {}
        if not is_admin and user_id:
            query = {"userId": user_id}

        cursor = self.enquiries.find(query).sort("createdAt", -1)
        raw_enqs = await cursor.to_list(length=100)

        return [
            EnquiryResponse(
                id=str(e.get("id") or e.get("_id")),
                propertyId=str(e.get("propertyId", "")),
                propertyTitle=e.get("propertyTitle", "Property"),
                userId=str(e.get("userId", "")),
                userName=e.get("userName", ""),
                userEmail=e.get("userEmail", ""),
                userPhone=e.get("userPhone", ""),
                message=e.get("message", ""),
                status=e.get("status", "new"),
                agentNotes=e.get("agentNotes", ""),
                createdAt=str(e.get("createdAt", "")),
            )
            for e in raw_enqs
        ]

    async def update_enquiry_status(
        self, enquiry_id: str, status: str, agent_notes: Optional[str] = None
    ) -> Optional[EnquiryResponse]:
        update_data: Dict[str, Any] = {"status": status}
        if agent_notes is not None:
            update_data["agentNotes"] = agent_notes

        res = await self.enquiries.find_one_and_update(
            {"$or": [{"id": enquiry_id}, {"_id": enquiry_id}]},
            {"$set": update_data},
            return_document=True,
        )
        if not res:
            return None

        return EnquiryResponse(
            id=str(res.get("id") or res.get("_id")),
            propertyId=str(res.get("propertyId", "")),
            propertyTitle=res.get("propertyTitle", "Property"),
            userId=str(res.get("userId", "")),
            userName=res.get("userName", ""),
            userEmail=res.get("userEmail", ""),
            userPhone=res.get("userPhone", ""),
            message=res.get("message", ""),
            status=res.get("status", "new"),
            agentNotes=res.get("agentNotes", ""),
            createdAt=str(res.get("createdAt", "")),
        )

    # ---------------------------------------------------------------------------
    # Notifications
    # ---------------------------------------------------------------------------
    async def list_notifications(self, user_id: Optional[str] = None) -> List[NotificationResponse]:
        cursor = self.notifications.find().sort("createdAt", -1).limit(10)
        docs = await cursor.to_list(length=10)
        return [
            NotificationResponse(
                id=str(d.get("id") or d.get("_id")),
                title=d.get("title", ""),
                message=d.get("message", ""),
                type=d.get("type", "info"),
                isRead=bool(d.get("isRead", False)),
                link=d.get("link"),
                createdAt=str(d.get("createdAt", "")),
            )
            for d in docs
        ]

    # ---------------------------------------------------------------------------
    # Unified Dashboard Data
    # ---------------------------------------------------------------------------
    async def get_dashboard_data(self, user: Any) -> DashboardDataResponse:
        user_id = str(user.id)
        is_admin = getattr(user, "role", "user") == "admin"

        # Counts
        properties_count = await self.properties.count_documents({})
        favorites_count = await self.favorites.count_documents({"userId": user_id})
        enquiries_count = (
            await self.enquiries.count_documents({})
            if is_admin
            else await self.enquiries.count_documents({"userId": user_id})
        )
        active_sites_count = await self.sites.count_documents({"status": "Active"})

        # Construction stock value calculation
        sites_cursor = self.sites.find({}, {"stockValue": 1})
        sites_list = await sites_cursor.to_list(length=100)
        total_stock_val = sum(float(s.get("stockValue", 0)) for s in sites_list)
        formatted_stock = format_inr(total_stock_val)

        # Recent enquiries
        recent_enqs = await self.list_enquiries(user_id=user_id, is_admin=is_admin)

        # Featured properties
        featured_cursor = self.properties.find({"featured": True}).limit(6)
        featured_docs = await featured_cursor.to_list(length=6)
        if not featured_docs:
            featured_cursor = self.properties.find().limit(6)
            featured_docs = await featured_cursor.to_list(length=6)

        # Favorites check
        fav_cursor = self.favorites.find({"userId": user_id})
        fav_docs = await fav_cursor.to_list(length=100)
        fav_ids = {str(d.get("propertyId")) for d in fav_docs}

        featured_props = [
            self._to_property_response(p, str(p.get("id") or p.get("_id")) in fav_ids)
            for p in featured_docs
        ]

        # Notifications
        notifs = await self.list_notifications(user_id=user_id)

        return DashboardDataResponse(
            userSummary=DashboardUserSummary(
                name=getattr(user, "name", "Anand User"),
                email=getattr(user, "email", ""),
                role=getattr(user, "role", "user"),
            ),
            propertiesCount=properties_count,
            favoritesCount=favorites_count,
            enquiriesCount=enquiries_count,
            activeSitesCount=active_sites_count,
            totalStockValueFormatted=formatted_stock,
            recentEnquiries=recent_enqs[:5],
            featuredProperties=featured_props,
            notifications=notifs,
        )
