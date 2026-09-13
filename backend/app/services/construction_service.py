import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
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
    SiteCreate,
    SitePhotoCreate,
    SitePhotoResponse,
    SiteResponse,
    SiteUpdate,
    StockInRequest,
    StockOutRequest,
    StockTransactionResponse,
)

logger = logging.getLogger("app.services.construction")


def _calc_stock_status(total_stock: float, min_stock: float) -> str:
    if total_stock <= 0:
        return "Out of Stock"
    elif total_stock <= min_stock:
        return "Low"
    elif total_stock <= min_stock * 1.5:
        return "Medium"
    return "Good"


def _format_inr(val: float) -> str:
    if val >= 10000000:
        return f"₹{val / 10000000:.1f} Cr"
    elif val >= 100000:
        return f"₹{val / 100000:.1f} L"
    return f"₹{val:,.0f}"


class ConstructionService:
    """Manages MongoDB operations for the Anand Homes Construction Management platform."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.sites = db["sites"]
        self.inventory = db["inventory"]
        self.stock_transactions = db["stock_transactions"]
        self.requests = db["material_requests"]
        self.deliveries = db["deliveries"]
        self.photos = db["site_photos"]
        self.activities = db["activities"]

    # -----------------------------------------------------------------------
    # Helper
    # -----------------------------------------------------------------------
    async def _persist(self) -> None:
        try:
            from app.database.mongodb import db_manager
            db_manager.mark_dirty()
            await db_manager.save_to_disk()
        except Exception:
            pass

    @staticmethod
    def _doc_to_res(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not doc:
            return None
        doc = dict(doc)
        if "_id" in doc and "id" not in doc:
            doc["id"] = str(doc["_id"])
        elif "_id" in doc:
            doc.pop("_id", None)
        return doc

    # -----------------------------------------------------------------------
    # -----------------------------------------------------------------------
    # Sites CRUD
    # -----------------------------------------------------------------------
    async def list_sites(
        self,
        supervisor: Optional[str] = None,
        supervisor_id: Optional[str] = None,
        supervisor_email: Optional[str] = None,
        admin_id: Optional[str] = None,
        admin_email: Optional[str] = None,
    ) -> List[SiteResponse]:
        query: Dict[str, Any] = {}
        and_clauses: List[Dict[str, Any]] = []

        # Admin isolation
        if admin_id or admin_email:
            admin_clauses: List[Dict[str, Any]] = []
            if admin_id:
                admin_clauses.append({"adminId": admin_id})
                admin_clauses.append({"createdBy": admin_id})
            if admin_email:
                admin_clauses.append({"adminEmail": {"$regex": f"^{re.escape(admin_email)}$", "$options": "i"}})
            if admin_email and admin_email.lower() == "admin@anandhomes.com":
                admin_clauses.append({"adminId": None})
                admin_clauses.append({"adminId": {"$exists": False}})
                admin_clauses.append({"adminId": ""})
            if admin_clauses:
                and_clauses.append({"$or": admin_clauses})

        # Supervisor isolation
        sup_clauses: List[Dict[str, Any]] = []
        if supervisor_id:
            sup_clauses.append({"supervisorId": supervisor_id})
        if supervisor_email:
            sup_clauses.append({"supervisorEmail": {"$regex": f"^{re.escape(supervisor_email)}$", "$options": "i"}})
        if supervisor:
            sup_clauses.append({"supervisor": {"$regex": f"^{re.escape(supervisor)}$", "$options": "i"}})
            sup_clauses.append({"supervisorEmail": {"$regex": f"^{re.escape(supervisor)}$", "$options": "i"}})
            sup_clauses.append({"supervisorId": supervisor})
        if sup_clauses:
            and_clauses.append({"$or": sup_clauses})

        if len(and_clauses) == 1:
            query = and_clauses[0]
        elif len(and_clauses) > 1:
            query = {"$and": and_clauses}

        cursor = self.sites.find(query)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(SiteResponse(**res))
        return items

    async def get_admin_site_names(self, admin_user: Any) -> List[str]:
        """Find names of all project sites owned by a specific admin."""
        user_id = str(getattr(admin_user, "id", ""))
        user_email = getattr(admin_user, "email", "")
        admin_or: List[Dict[str, Any]] = []
        if user_id:
            admin_or.append({"adminId": user_id})
            admin_or.append({"createdBy": user_id})
        if user_email:
            admin_or.append({"adminEmail": {"$regex": f"^{re.escape(user_email)}$", "$options": "i"}})
        if user_email and user_email.lower() == "admin@anandhomes.com":
            admin_or.append({"adminId": None})
            admin_or.append({"adminId": {"$exists": False}})
            admin_or.append({"adminId": ""})

        if not admin_or:
            return []

        cursor = self.sites.find({"$or": admin_or})
        names = []
        async for doc in cursor:
            if doc.get("name"):
                names.append(doc["name"])
        return names

    async def get_supervisor_site_names(self, supervisor_user: Any) -> List[str]:
        """Find names of all project sites assigned to a specific supervisor."""
        or_clauses = []
        user_id = str(getattr(supervisor_user, "id", ""))
        user_email = getattr(supervisor_user, "email", "")
        user_name = getattr(supervisor_user, "name", "")

        if user_id:
            or_clauses.append({"supervisorId": user_id})
        if user_email:
            or_clauses.append({"supervisorEmail": {"$regex": f"^{re.escape(user_email)}$", "$options": "i"}})
        if user_name:
            or_clauses.append({"supervisor": {"$regex": f"^{re.escape(user_name)}$", "$options": "i"}})

        if not or_clauses:
            return []

        cursor = self.sites.find({"$or": or_clauses})
        names = []
        async for doc in cursor:
            if doc.get("name"):
                names.append(doc["name"])
        return names

    async def get_site(self, site_id: str) -> Optional[SiteResponse]:
        doc = await self.sites.find_one({"$or": [{"id": site_id}, {"_id": site_id}]})
        res = self._doc_to_res(doc)
        return SiteResponse(**res) if res else None

    async def create_site(self, data: SiteCreate, admin_user: Optional[Any] = None) -> SiteResponse:
        site_id = f"s-{uuid.uuid4().hex[:6]}"
        doc = data.model_dump()
        doc["id"] = site_id
        doc["_id"] = site_id
        doc["createdAt"] = datetime.now(timezone.utc).isoformat()
        if admin_user:
            doc["adminId"] = str(getattr(admin_user, "id", ""))
            doc["adminEmail"] = getattr(admin_user, "email", "")
            doc["createdBy"] = str(getattr(admin_user, "id", ""))
        elif data.adminId:
            doc["adminId"] = data.adminId
            doc["adminEmail"] = data.adminEmail
            doc["createdBy"] = data.createdBy or data.adminId

        if not doc.get("stockValueFormatted") or doc["stockValueFormatted"] == "₹0":
            doc["stockValueFormatted"] = _format_inr(doc.get("stockValue", 0))

        await self.sites.insert_one(doc)
        await self.log_activity(
            text=f"New site added: {data.name}",
            subtext=f"Code: {data.code} | Location: {data.location}",
            site=data.name,
            act_type="stock_in",
        )
        await self._persist()
        return SiteResponse(**self._doc_to_res(doc))

    async def update_site(self, site_id: str, data: SiteUpdate) -> Optional[SiteResponse]:
        update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if "stockValue" in update_fields and not update_fields.get("stockValueFormatted"):
            update_fields["stockValueFormatted"] = _format_inr(update_fields["stockValue"])

        if update_fields:
            update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
            for attempt in range(2):
                try:
                    res = await self.sites.find_one_and_update(
                        {"$or": [{"id": site_id}, {"_id": site_id}]},
                        {"$set": update_fields},
                        return_document=True,
                    )
                    if not res and data.name:
                        doc = data.model_dump()
                        doc["id"] = site_id
                        doc["_id"] = site_id
                        doc["createdAt"] = datetime.now(timezone.utc).isoformat()
                        doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
                        if not doc.get("stockValueFormatted"):
                            doc["stockValueFormatted"] = _format_inr(doc.get("stockValue", 0))
                        await self.sites.insert_one(doc)
                        await self._persist()
                        return SiteResponse(**self._doc_to_res(doc))

                    await self._persist()
                    return SiteResponse(**self._doc_to_res(res)) if res else None
                except Exception:
                    if attempt == 1:
                        raise
                    await asyncio.sleep(0.3)
        return await self.get_site(site_id)

    async def delete_site(self, site_id: str) -> bool:
        res = await self.sites.delete_one({"$or": [{"id": site_id}, {"_id": site_id}]})
        if res.deleted_count > 0:
            await self._persist()
            return True
        return False

    # -----------------------------------------------------------------------
    # Inventory CRUD
    # -----------------------------------------------------------------------
    @staticmethod
    def _apply_site_filter(
        query: Dict[str, Any], site: Optional[str], allowed_sites: Optional[List[str]]
    ) -> bool:
        """Helper to apply site/allowed_sites scoping. Returns False if query should return empty set immediately."""
        if allowed_sites is not None:
            if not allowed_sites:
                return False
            if site and site.lower() != "all":
                if site in allowed_sites:
                    query["site"] = site
                else:
                    return False
            else:
                query["site"] = {"$in": allowed_sites}
        elif site and site.lower() != "all":
            query["site"] = site
        return True

    async def list_inventory(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[InventoryResponse]:
        query: Dict[str, Any] = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        cursor = self.inventory.find(query)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(InventoryResponse(**res))
        return items

    async def get_inventory_item(self, item_id: str) -> Optional[InventoryResponse]:
        doc = await self.inventory.find_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        res = self._doc_to_res(doc)
        return InventoryResponse(**res) if res else None

    async def create_inventory_item(self, data: InventoryItemCreate) -> InventoryResponse:
        item_id = f"inv-{uuid.uuid4().hex[:6]}"
        doc = data.model_dump()
        doc["id"] = item_id
        doc["_id"] = item_id
        doc["status"] = _calc_stock_status(doc["totalStock"], doc["minStock"])
        doc["createdAt"] = datetime.now(timezone.utc).isoformat()

        await self.inventory.insert_one(doc)
        return InventoryResponse(**self._doc_to_res(doc))

    async def update_inventory_item(self, item_id: str, data: InventoryItemUpdate) -> Optional[InventoryResponse]:
        update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if "totalStock" in update_fields or "minStock" in update_fields:
            current = await self.inventory.find_one({"$or": [{"id": item_id}, {"_id": item_id}]})
            if current:
                tot = update_fields.get("totalStock", current.get("totalStock", 0))
                min_s = update_fields.get("minStock", current.get("minStock", 0))
                update_fields["status"] = _calc_stock_status(tot, min_s)

        if update_fields:
            for attempt in range(2):
                try:
                    res = await self.inventory.find_one_and_update(
                        {"$or": [{"id": item_id}, {"_id": item_id}]},
                        {"$set": update_fields},
                        return_document=True,
                    )
                    if not res and data.name and data.site:
                        doc = data.model_dump()
                        doc["id"] = item_id
                        doc["_id"] = item_id
                        tot = doc.get("totalStock", 0)
                        min_s = doc.get("minStock", 10)
                        doc["status"] = _calc_stock_status(tot, min_s)
                        doc["createdAt"] = datetime.now(timezone.utc).isoformat()
                        await self.inventory.insert_one(doc)
                        return InventoryResponse(**self._doc_to_res(doc))

                    return InventoryResponse(**self._doc_to_res(res)) if res else None
                except Exception:
                    if attempt == 1:
                        raise
                    await asyncio.sleep(0.3)
        return await self.get_inventory_item(item_id)

    async def delete_inventory_item(self, item_id: str) -> bool:
        res = await self.inventory.delete_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        return res.deleted_count > 0

    async def get_low_stock(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {"status": {"$in": ["Low", "Out of Stock"]}}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        cursor = self.inventory.find(query)
        alerts = []
        async for doc in cursor:
            alerts.append({
                "id": f"alert-{doc.get('id', doc.get('_id'))}",
                "material": doc["name"],
                "site": doc["site"],
                "currentStock": doc["totalStock"],
                "reorderLevel": doc["minStock"],
                "unit": doc["unit"],
                "status": "Critical" if doc["status"] == "Out of Stock" else "Low",
                "recommendation": f"Order {int(doc['minStock'] * 2 - doc['totalStock'])} {doc['unit']} immediately",
            })
        return alerts

    # -----------------------------------------------------------------------
    # Stock In / Stock Out
    # -----------------------------------------------------------------------
    async def record_stock_in(self, data: StockInRequest) -> StockTransactionResponse:
        trans_id = f"tx-in-{uuid.uuid4().hex[:6]}"
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")

        # 1. Update or Insert Inventory Item
        inv_item = await self.inventory.find_one({
            "site": data.site,
            "name": {"$regex": f"^{data.material.strip()}$", "$options": "i"},
        })

        if inv_item:
            new_stock = inv_item.get("totalStock", 0) + data.quantity
            min_stock = inv_item.get("minStock", 100)
            new_status = _calc_stock_status(new_stock, min_stock)
            await self.inventory.update_one(
                {"_id": inv_item["_id"]},
                {"$set": {"totalStock": new_stock, "status": new_status, "updatedAt": now_str}},
            )
        else:
            new_id = f"inv-{uuid.uuid4().hex[:6]}"
            min_stock = 100.0
            await self.inventory.insert_one({
                "_id": new_id,
                "id": new_id,
                "name": data.material.strip(),
                "category": "Others",
                "unit": data.unit,
                "totalStock": data.quantity,
                "minStock": min_stock,
                "status": _calc_stock_status(data.quantity, min_stock),
                "site": data.site,
                "createdAt": now_str,
            })

        # 2. Record Transaction
        tx_doc = {
            "_id": trans_id,
            "id": trans_id,
            "site": data.site,
            "material": data.material,
            "quantity": data.quantity,
            "unit": data.unit,
            "type": "stock_in",
            "reference": data.invoiceNo or "Invoice",
            "actor": data.supplier,
            "timestamp": now_str,
            "notes": data.notes,
        }
        await self.stock_transactions.insert_one(tx_doc)

        # 3. Log Activity
        await self.log_activity(
            text=f"Stock In: {data.quantity} {data.unit} of {data.material}",
            subtext=f"Supplier: {data.supplier} | Inv: {data.invoiceNo}",
            site=data.site,
            act_type="stock_in",
        )
        await self._persist()
        return StockTransactionResponse(**self._doc_to_res(tx_doc))

    async def record_stock_out(self, data: StockOutRequest) -> StockTransactionResponse:
        trans_id = f"tx-out-{uuid.uuid4().hex[:6]}"
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")

        # 1. Decrement Inventory
        inv_item = await self.inventory.find_one({
            "site": data.site,
            "name": {"$regex": f"^{data.material.strip()}$", "$options": "i"},
        })

        if inv_item:
            current_stock = inv_item.get("totalStock", 0)
            new_stock = max(0.0, current_stock - data.quantity)
            min_stock = inv_item.get("minStock", 100)
            new_status = _calc_stock_status(new_stock, min_stock)
            await self.inventory.update_one(
                {"_id": inv_item["_id"]},
                {"$set": {"totalStock": new_stock, "status": new_status, "updatedAt": now_str}},
            )

        # 2. Record Transaction
        tx_doc = {
            "_id": trans_id,
            "id": trans_id,
            "site": data.site,
            "material": data.material,
            "quantity": data.quantity,
            "unit": data.unit,
            "type": "stock_out",
            "reference": data.usedFor,
            "actor": data.requestedBy,
            "timestamp": now_str,
            "notes": data.notes,
        }
        await self.stock_transactions.insert_one(tx_doc)

        # 3. Log Activity
        await self.log_activity(
            text=f"Stock Out: {data.quantity} {data.unit} of {data.material}",
            subtext=f"For: {data.usedFor} | Req By: {data.requestedBy}",
            site=data.site,
            act_type="stock_out",
        )
        await self._persist()
        return StockTransactionResponse(**self._doc_to_res(tx_doc))

    async def list_transactions(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[StockTransactionResponse]:
        query = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []
        cursor = self.stock_transactions.find(query).sort("_id", -1)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(StockTransactionResponse(**res))
        return items

    # -----------------------------------------------------------------------
    # Material Requests
    # -----------------------------------------------------------------------
    async def list_requests(
        self,
        site: Optional[str] = None,
        status: Optional[str] = None,
        allowed_sites: Optional[List[str]] = None,
    ) -> List[MaterialRequestResponse]:
        query = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []
        if status:
            query["status"] = status

        cursor = self.requests.find(query).sort("requestedOn", -1)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(MaterialRequestResponse(**res))
        return items

    async def create_request(self, data: MaterialRequestCreate) -> MaterialRequestResponse:
        count = await self.requests.count_documents({})
        req_id_str = f"REQ-2025-{count + 101:03d}"
        doc_id = f"mr-{uuid.uuid4().hex[:6]}"
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")

        doc = data.model_dump()
        doc["id"] = doc_id
        doc["_id"] = doc_id
        doc["requestId"] = req_id_str
        doc["requestedOn"] = now_str
        doc["status"] = "Pending"

        await self.requests.insert_one(doc)

        await self.log_activity(
            text=f"Material requested: {data.quantity} {data.unit} of {data.material}",
            subtext=f"Site: {data.site} | Ref: {req_id_str}",
            site=data.site,
            act_type="request",
        )
        await self._persist()
        return MaterialRequestResponse(**self._doc_to_res(doc))

    async def update_request_status(self, request_id: str, status: str) -> Optional[MaterialRequestResponse]:
        res = await self.requests.find_one_and_update(
            {"$or": [{"id": request_id}, {"_id": request_id}, {"requestId": request_id}]},
            {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc).isoformat()}},
            return_document=True,
        )
        if res:
            await self.log_activity(
                text=f"Material request {res.get('requestId')}: {status}",
                subtext=f"Material: {res.get('material')} | Site: {res.get('site')}",
                site=res.get("site", "All Sites"),
                act_type="request",
            )
            await self._persist()
            return MaterialRequestResponse(**self._doc_to_res(res))
        return None

    async def delete_request(self, request_id: str) -> bool:
        res = await self.requests.delete_one(
            {"$or": [{"id": request_id}, {"_id": request_id}, {"requestId": request_id}]}
        )
        if res.deleted_count > 0:
            await self._persist()
            return True
        return False

    # -----------------------------------------------------------------------
    # Deliveries
    # -----------------------------------------------------------------------
    async def list_deliveries(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[DeliveryResponse]:
        query = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        cursor = self.deliveries.find(query).sort("_id", -1)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(DeliveryResponse(**res))
        return items

    async def create_delivery(self, data: DeliveryCreate) -> DeliveryResponse:
        count = await self.deliveries.count_documents({})
        deliv_id = data.deliveryId or f"DEL-2025-{count + 101:03d}"
        doc_id = f"del-{uuid.uuid4().hex[:6]}"

        doc = data.model_dump()
        doc["id"] = doc_id
        doc["_id"] = doc_id
        doc["deliveryId"] = deliv_id
        if not doc.get("expectedDate"):
            doc["expectedDate"] = datetime.now(timezone.utc).strftime("%d %b %Y")

        await self.deliveries.insert_one(doc)

        await self.log_activity(
            text=f"Delivery Scheduled: {doc['expectedQty']} {doc['unit']} of {doc['material']}",
            subtext=f"Supplier: {doc['supplier']} | Ref: {deliv_id}",
            site=doc["site"],
            act_type="delivery",
        )
        await self._persist()
        return DeliveryResponse(**self._doc_to_res(doc))

    async def update_delivery(self, delivery_id: str, data: DeliveryUpdate) -> Optional[DeliveryResponse]:
        update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_fields:
            res = await self.deliveries.find_one_and_update(
                {"$or": [{"id": delivery_id}, {"_id": delivery_id}, {"deliveryId": delivery_id}]},
                {"$set": update_fields},
                return_document=True,
            )
            await self._persist()
            return DeliveryResponse(**self._doc_to_res(res)) if res else None
        return None

    async def delete_delivery(self, delivery_id: str) -> bool:
        res = await self.deliveries.delete_one(
            {"$or": [{"id": delivery_id}, {"_id": delivery_id}, {"deliveryId": delivery_id}]}
        )
        if res.deleted_count > 0:
            await self._persist()
            return True
        return False

    # -----------------------------------------------------------------------
    # Photos
    # -----------------------------------------------------------------------
    async def list_photos(
        self,
        site: Optional[str] = None,
        photo_type: Optional[str] = None,
        allowed_sites: Optional[List[str]] = None,
    ) -> List[SitePhotoResponse]:
        query = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []
        if photo_type:
            query["type"] = photo_type

        cursor = self.photos.find(query).sort("_id", -1)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(SitePhotoResponse(**res))
        return items

    async def add_photo(self, data: SitePhotoCreate) -> SitePhotoResponse:
        photo_id = f"p-{uuid.uuid4().hex[:6]}"
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")

        doc = data.model_dump()
        doc["id"] = photo_id
        doc["_id"] = photo_id
        doc["timestamp"] = now_str

        await self.photos.insert_one(doc)
        await self.log_activity(
            text=f"New photo uploaded: {data.title}",
            subtext=f"Type: {data.type} | Site: {data.site}",
            site=data.site,
            act_type="photo",
        )
        await self._persist()
        return SitePhotoResponse(**self._doc_to_res(doc))

    async def delete_photo(self, photo_id: str) -> bool:
        res = await self.photos.delete_one({"$or": [{"id": photo_id}, {"_id": photo_id}]})
        if res.deleted_count > 0:
            await self._persist()
            return True
        return False

    # -----------------------------------------------------------------------
    # Activities & Dashboard Summary
    # -----------------------------------------------------------------------
    async def log_activity(self, text: str, site: str, act_type: str, subtext: Optional[str] = None) -> None:
        try:
            act_id = f"act-{uuid.uuid4().hex[:6]}"
            now_str = datetime.now(timezone.utc).strftime("%d %b, %I:%M %p")
            await self.activities.insert_one({
                "_id": act_id,
                "id": act_id,
                "text": text,
                "subtext": subtext,
                "site": site,
                "time": now_str,
                "type": act_type,
            })
        except Exception as exc:
            logger.warning("Could not log activity: %s", exc)

    async def list_activities(
        self,
        site: Optional[str] = None,
        limit: int = 20,
        allowed_sites: Optional[List[str]] = None,
    ) -> List[ActivityResponse]:
        query = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        cursor = self.activities.find(query).sort("_id", -1).limit(limit)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(ActivityResponse(**res))
        return items

    async def get_dashboard_summary(
        self,
        site: Optional[str] = None,
        allowed_sites: Optional[List[str]] = None,
        admin_id: Optional[str] = None,
        admin_email: Optional[str] = None,
    ) -> DashboardSummaryResponse:
        # Sites
        sites_list = await self.list_sites(admin_id=admin_id, admin_email=admin_email)
        if allowed_sites is not None:
            sites_list = [s for s in sites_list if s.name in allowed_sites]

        total_sites = len(sites_list)
        active_sites = sum(1 for s in sites_list if s.status == "Active")

        # Inventory
        inv_items = await self.list_inventory(site, allowed_sites=allowed_sites)
        total_materials = len(inv_items)
        low_stock_count = sum(1 for i in inv_items if i.status == "Low")
        critical_count = sum(1 for i in inv_items if i.status == "Out of Stock")

        # Total value
        total_value = sum(s.stockValue for s in sites_list)

        # Requests & Deliveries
        req_query: Dict[str, Any] = {"status": "Pending"}
        deliv_query: Dict[str, Any] = {"status": {"$in": ["Expected", "In Transit"]}}

        has_reqs = self._apply_site_filter(req_query, site, allowed_sites)
        has_delivs = self._apply_site_filter(deliv_query, site, allowed_sites)

        pending_requests = await self.requests.count_documents(req_query) if has_reqs else 0
        active_deliveries = await self.deliveries.count_documents(deliv_query) if has_delivs else 0

        return DashboardSummaryResponse(
            totalSites=total_sites,
            activeSites=active_sites,
            totalInventoryValue=total_value,
            formattedInventoryValue=_format_inr(total_value),
            totalMaterials=total_materials,
            pendingRequestsCount=pending_requests,
            activeDeliveriesCount=active_deliveries,
            lowStockCount=low_stock_count,
            criticalAlertsCount=critical_count,
        )

    # -----------------------------------------------------------------------
    # Database Auto-Seeding (Clean - No dummy data)
    # -----------------------------------------------------------------------
    async def seed_database_if_empty(self) -> None:
        """Clean start - no dummy data is seeded."""
        logger.info("Database initialized cleanly without dummy data.")
