import logging
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
    # Sites CRUD
    # -----------------------------------------------------------------------
    async def list_sites(self) -> List[SiteResponse]:
        cursor = self.sites.find({})
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(SiteResponse(**res))
        return items

    async def get_site(self, site_id: str) -> Optional[SiteResponse]:
        doc = await self.sites.find_one({"$or": [{"id": site_id}, {"_id": site_id}]})
        res = self._doc_to_res(doc)
        return SiteResponse(**res) if res else None

    async def create_site(self, data: SiteCreate) -> SiteResponse:
        site_id = f"s-{uuid.uuid4().hex[:6]}"
        doc = data.model_dump()
        doc["id"] = site_id
        doc["_id"] = site_id
        doc["createdAt"] = datetime.now(timezone.utc).isoformat()
        if not doc.get("stockValueFormatted") or doc["stockValueFormatted"] == "₹0":
            doc["stockValueFormatted"] = _format_inr(doc.get("stockValue", 0))

        await self.sites.insert_one(doc)
        await self.log_activity(
            text=f"New site added: {data.name}",
            subtext=f"Code: {data.code} | Location: {data.location}",
            site=data.name,
            act_type="stock_in",
        )
        return SiteResponse(**self._doc_to_res(doc))

    async def update_site(self, site_id: str, data: SiteUpdate) -> Optional[SiteResponse]:
        update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if "stockValue" in update_fields and not update_fields.get("stockValueFormatted"):
            update_fields["stockValueFormatted"] = _format_inr(update_fields["stockValue"])

        if update_fields:
            update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
            res = await self.sites.find_one_and_update(
                {"$or": [{"id": site_id}, {"_id": site_id}]},
                {"$set": update_fields},
                return_document=True,
            )
            return SiteResponse(**self._doc_to_res(res)) if res else None
        return await self.get_site(site_id)

    async def delete_site(self, site_id: str) -> bool:
        res = await self.sites.delete_one({"$or": [{"id": site_id}, {"_id": site_id}]})
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Inventory CRUD
    # -----------------------------------------------------------------------
    async def list_inventory(self, site: Optional[str] = None) -> List[InventoryResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site

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
            res = await self.inventory.find_one_and_update(
                {"$or": [{"id": item_id}, {"_id": item_id}]},
                {"$set": update_fields},
                return_document=True,
            )
            return InventoryResponse(**self._doc_to_res(res)) if res else None
        return await self.get_inventory_item(item_id)

    async def delete_inventory_item(self, item_id: str) -> bool:
        res = await self.inventory.delete_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        return res.deleted_count > 0

    async def get_low_stock(self, site: Optional[str] = None) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {"status": {"$in": ["Low", "Out of Stock"]}}
        if site and site.lower() != "all":
            query["site"] = site

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
            subtext=f"Used for: {data.usedFor} | By: {data.requestedBy}",
            site=data.site,
            act_type="stock_out",
        )

        return StockTransactionResponse(**self._doc_to_res(tx_doc))

    async def list_transactions(self, site: Optional[str] = None) -> List[StockTransactionResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site
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
        self, site: Optional[str] = None, status: Optional[str] = None
    ) -> List[MaterialRequestResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site
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
            return MaterialRequestResponse(**self._doc_to_res(res))
        return None

    async def delete_request(self, request_id: str) -> bool:
        res = await self.requests.delete_one(
            {"$or": [{"id": request_id}, {"_id": request_id}, {"requestId": request_id}]}
        )
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Deliveries
    # -----------------------------------------------------------------------
    async def list_deliveries(self, site: Optional[str] = None) -> List[DeliveryResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site

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
        return DeliveryResponse(**self._doc_to_res(doc))

    async def update_delivery(self, delivery_id: str, data: DeliveryUpdate) -> Optional[DeliveryResponse]:
        update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_fields:
            res = await self.deliveries.find_one_and_update(
                {"$or": [{"id": delivery_id}, {"_id": delivery_id}, {"deliveryId": delivery_id}]},
                {"$set": update_fields},
                return_document=True,
            )
            return DeliveryResponse(**self._doc_to_res(res)) if res else None
        return None

    async def delete_delivery(self, delivery_id: str) -> bool:
        res = await self.deliveries.delete_one(
            {"$or": [{"id": delivery_id}, {"_id": delivery_id}, {"deliveryId": delivery_id}]}
        )
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Photos
    # -----------------------------------------------------------------------
    async def list_photos(self, site: Optional[str] = None, photo_type: Optional[str] = None) -> List[SitePhotoResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site
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
        return SitePhotoResponse(**self._doc_to_res(doc))

    async def delete_photo(self, photo_id: str) -> bool:
        res = await self.photos.delete_one({"$or": [{"id": photo_id}, {"_id": photo_id}]})
        return res.deleted_count > 0

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

    async def list_activities(self, site: Optional[str] = None, limit: int = 20) -> List[ActivityResponse]:
        query = {}
        if site and site.lower() != "all":
            query["site"] = site

        cursor = self.activities.find(query).sort("_id", -1).limit(limit)
        items = []
        async for doc in cursor:
            res = self._doc_to_res(doc)
            if res:
                items.append(ActivityResponse(**res))
        return items

    async def get_dashboard_summary(self, site: Optional[str] = None) -> DashboardSummaryResponse:
        # Sites
        sites_list = await self.list_sites()
        total_sites = len(sites_list)
        active_sites = sum(1 for s in sites_list if s.status == "Active")

        # Inventory
        inv_items = await self.list_inventory(site)
        total_materials = len(inv_items)
        low_stock_count = sum(1 for i in inv_items if i.status == "Low")
        critical_count = sum(1 for i in inv_items if i.status == "Out of Stock")

        # Total value
        total_value = sum(s.stockValue for s in sites_list)

        # Requests & Deliveries
        pending_requests = await self.requests.count_documents(
            {"status": "Pending", **({"site": site} if site and site.lower() != "all" else {})}
        )
        active_deliveries = await self.deliveries.count_documents(
            {"status": {"$in": ["Expected", "In Transit"]}, **({"site": site} if site and site.lower() != "all" else {})}
        )

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
    # Database Auto-Seeding
    # -----------------------------------------------------------------------
    async def seed_database_if_empty(self) -> None:
        """Seeds initial construction data into MongoDB if the collections are empty."""
        try:
            sites_count = await self.sites.count_documents({})
            if sites_count > 0:
                logger.info("MongoDB already contains %d sites; skipping auto-seed.", sites_count)
                return

            logger.info("MongoDB is empty. Seeding initial Anand Homes construction data...")

            # 1. Sites
            initial_sites = [
                {
                    "_id": "s-1",
                    "id": "s-1",
                    "code": "RBL-S-001",
                    "name": "Site Alpha",
                    "location": "Chennai, TN",
                    "supervisor": "Rajesh Kumar",
                    "status": "Active",
                    "totalMaterials": 32,
                    "stockValue": 824500,
                    "stockValueFormatted": "₹8.2 L",
                    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80",
                    "startDate": "12 Jan 2025",
                    "contact": "98765 43210",
                    "projectType": "Anna Nagar Residential",
                },
                {
                    "_id": "s-2",
                    "id": "s-2",
                    "code": "RBL-S-002",
                    "name": "Site Beta",
                    "location": "Coimbatore, TN",
                    "supervisor": "Siva Kumar",
                    "status": "Active",
                    "totalMaterials": 26,
                    "stockValue": 661200,
                    "stockValueFormatted": "₹6.6 L",
                    "imageUrl": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80",
                    "startDate": "20 Feb 2025",
                    "contact": "98765 43211",
                    "projectType": "Commercial Complex",
                },
                {
                    "_id": "s-3",
                    "id": "s-3",
                    "code": "RBL-S-003",
                    "name": "Site Gamma",
                    "location": "Madurai, TN",
                    "supervisor": "Karthik R",
                    "status": "Active",
                    "totalMaterials": 19,
                    "stockValue": 418000,
                    "stockValueFormatted": "₹4.2 L",
                    "imageUrl": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
                    "startDate": "05 Mar 2025",
                    "contact": "98765 43212",
                    "projectType": "Villa Enclave Phase 1",
                },
            ]
            await self.sites.insert_many(initial_sites)

            # 2. Inventory Items
            initial_inventory = [
                {"_id": "inv-1", "id": "inv-1", "name": "UltraTech PPC Cement", "category": "Cement", "unit": "Bags", "totalStock": 420, "minStock": 100, "status": "Good", "site": "Site Alpha"},
                {"_id": "inv-2", "id": "inv-2", "name": "TMT Steel Bars 12mm", "category": "Steel", "unit": "Tons", "totalStock": 8.5, "minStock": 15, "status": "Low", "site": "Site Alpha"},
                {"_id": "inv-3", "id": "inv-3", "name": "River Sand (Coarse)", "category": "Aggregate", "unit": "Cu.ft", "totalStock": 1200, "minStock": 400, "status": "Good", "site": "Site Alpha"},
                {"_id": "inv-4", "id": "inv-4", "name": "Red Clay Bricks", "category": "Masonry", "unit": "Pieces", "totalStock": 4500, "minStock": 1000, "status": "Good", "site": "Site Alpha"},
                {"_id": "inv-5", "id": "inv-5", "name": "Berger Weathercoat Paint", "category": "Finishing", "unit": "Litres", "totalStock": 0, "minStock": 50, "status": "Out of Stock", "site": "Site Alpha"},
                {"_id": "inv-6", "id": "inv-6", "name": "UltraTech Super Cement", "category": "Cement", "unit": "Bags", "totalStock": 310, "minStock": 120, "status": "Good", "site": "Site Beta"},
                {"_id": "inv-7", "id": "inv-7", "name": "TMT Steel Bars 16mm", "category": "Steel", "unit": "Tons", "totalStock": 4.2, "minStock": 10, "status": "Low", "site": "Site Beta"},
            ]
            await self.inventory.insert_many(initial_inventory)

            # 3. Material Requests
            initial_requests = [
                {
                    "_id": "req-1",
                    "id": "req-1",
                    "requestId": "REQ-2025-001",
                    "site": "Site Alpha",
                    "material": "TMT Steel Bars 12mm",
                    "quantity": 10,
                    "unit": "Tons",
                    "requestedBy": "Rajesh Kumar (Supervisor)",
                    "requestedOn": "09 Mar 2025, 10:30 AM",
                    "requiredDate": "14 Mar 2025",
                    "purpose": "Column reinforcement for 2nd floor slab",
                    "status": "Pending",
                    "notes": "Urgent - current stock is critical",
                },
                {
                    "_id": "req-2",
                    "id": "req-2",
                    "requestId": "REQ-2025-002",
                    "site": "Site Beta",
                    "material": "UltraTech Super Cement",
                    "quantity": 200,
                    "unit": "Bags",
                    "requestedBy": "Siva Kumar (Supervisor)",
                    "requestedOn": "08 Mar 2025, 03:15 PM",
                    "requiredDate": "12 Mar 2025",
                    "purpose": "Brickwork for boundary wall",
                    "status": "Approved",
                    "notes": "PO sent to Dalmia distributors",
                },
            ]
            await self.requests.insert_many(initial_requests)

            # 4. Deliveries
            initial_deliveries = [
                {
                    "_id": "del-1",
                    "id": "del-1",
                    "deliveryId": "DEL-2025-089",
                    "supplier": "Tata Tiscon Direct",
                    "site": "Site Alpha",
                    "material": "TMT Steel Bars 12mm",
                    "expectedQty": 10,
                    "receivedQty": 0,
                    "unit": "Tons",
                    "status": "In Transit",
                    "expectedDate": "11 Mar 2025",
                    "invoiceNo": "TT-CHE-8902",
                },
                {
                    "_id": "del-2",
                    "id": "del-2",
                    "deliveryId": "DEL-2025-088",
                    "supplier": "UltraTech Cements Hub",
                    "site": "Site Alpha",
                    "material": "UltraTech PPC Cement",
                    "expectedQty": 300,
                    "receivedQty": 300,
                    "unit": "Bags",
                    "status": "Received",
                    "receivedOn": "08 Mar 2025, 02:40 PM",
                    "invoiceNo": "UTC-2025-110",
                    "receivedBy": "Rajesh Kumar",
                },
            ]
            await self.deliveries.insert_many(initial_deliveries)

            # 5. Photos
            initial_photos = [
                {
                    "_id": "p-1",
                    "id": "p-1",
                    "title": "Cement Unloading - Truck TN09-BX-4421",
                    "site": "Site Alpha",
                    "type": "Stock In",
                    "timestamp": "08 Mar 2025, 02:45 PM",
                    "imageUrl": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
                    "uploader": "Rajesh Kumar",
                },
                {
                    "_id": "p-2",
                    "id": "p-2",
                    "title": "2nd Floor Slab Shuttering Progress",
                    "site": "Site Alpha",
                    "type": "Site Progress",
                    "timestamp": "07 Mar 2025, 11:30 AM",
                    "imageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80",
                    "uploader": "Ramesh E (Site Eng)",
                },
            ]
            await self.photos.insert_many(initial_photos)

            # 6. Activities
            initial_activities = [
                {"_id": "a-1", "id": "a-1", "text": "Stock In: 300 Bags UltraTech Cement", "subtext": "Site Alpha | Truck TN-09-BX-4421", "site": "Site Alpha", "time": "10m ago", "type": "stock_in"},
                {"_id": "a-2", "id": "a-2", "text": "Material Request REQ-2025-001 created", "subtext": "10 Tons TMT Steel 12mm | Pending", "site": "Site Alpha", "time": "45m ago", "type": "request"},
                {"_id": "a-3", "id": "a-3", "text": "Stock Out: 40 Bags Cement issued", "subtext": "Site Alpha | Foundation work", "site": "Site Alpha", "time": "2h ago", "type": "stock_out"},
            ]
            await self.activities.insert_many(initial_activities)

            logger.info("Successfully seeded Anand Homes database with sample construction data!")
        except Exception as exc:
            logger.warning("Auto-seed encountered an issue: %s", exc)
