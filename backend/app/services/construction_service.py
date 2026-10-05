import csv
import io
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
    ProjectMasterCreate,
    ProjectMasterUpdate,
    ProjectMasterResponse,
    SupervisorMasterCreate,
    SupervisorMasterUpdate,
    SupervisorMasterResponse,
    ProjectDurationCreate,
    ProjectDurationResponse,
    InventoryMasterCreate,
    InventoryMasterUpdate,
    InventoryMasterResponse,
    InwardMaterialCreate,
    InwardMaterialResponse,
    OutwardMaterialCreate,
    OutwardMaterialResponse,
    LabourEntryCreate,
    LabourEntryResponse,
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
        self.projects_master = db["projects_master"]
        self.supervisors_master = db["supervisors_master"]
        self.project_durations = db["project_durations"]
        self.inventory_master = db["inventory_master"]
        self.material_inward = db["material_inward"]
        self.material_outward = db["material_outward"]
        self.labour_entries = db["labour_entries"]

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
        if "supervisor" not in doc or not doc["supervisor"]:
            doc["supervisor"] = "Unassigned"
        if "code" not in doc or not doc["code"]:
            doc["code"] = "SITE-001"
        if "location" not in doc or not doc["location"]:
            doc["location"] = "On-site"
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
        is_all = not site or site.strip().lower() in ("all", "all sites", "")
        if allowed_sites is not None:
            if not allowed_sites:
                return False
            if not is_all:
                if site in allowed_sites:
                    query["site"] = site
                else:
                    return False
            else:
                query["site"] = {"$in": allowed_sites + ["All Sites"]}
        elif not is_all:
            query["site"] = site
        return True

    async def sync_master_to_inventory(self) -> None:
        """Ensure all materials defined in Inventory Master exist in Stock Tracking (self.inventory)."""
        try:
            site_names = []
            cursor = self.sites.find({})
            async for s in cursor:
                s_name = s.get("name")
                if s_name and s_name not in site_names:
                    site_names.append(s_name)
            if not site_names:
                site_names = ["Site A"]

            master_cursor = self.inventory_master.find({})
            async for m in master_cursor:
                mat_name = (m.get("material") or "").strip()
                if not mat_name:
                    continue
                cat = m.get("category") or "Others"
                unit = m.get("measurement") or "Units"
                init_stock = float(m.get("initialStock", 0.0) or 0.0)
                min_s = float(m.get("minStock", 10.0) or 10.0)
                target_sites = [m.get("site")] if m.get("site") and m.get("site") != "All Sites" else site_names

                for s_name in target_sites:
                    existing = await self.inventory.find_one({
                        "name": {"$regex": f"^{re.escape(mat_name)}$", "$options": "i"},
                        "$or": [{"site": s_name}, {"site": "All Sites"}]
                    })
                    if not existing:
                        inv_id = f"inv-{uuid.uuid4().hex[:6]}"
                        await self.inventory.insert_one({
                            "id": inv_id,
                            "_id": inv_id,
                            "name": mat_name,
                            "category": cat,
                            "unit": unit,
                            "totalStock": init_stock,
                            "minStock": min_s,
                            "status": _calc_stock_status(init_stock, min_s),
                            "site": s_name,
                            "unitPrice": 0.0,
                            "createdAt": datetime.now(timezone.utc).isoformat(),
                            "updatedAt": datetime.now(timezone.utc).isoformat(),
                        })
        except Exception as e:
            logger.warning(f"Error syncing master to inventory: {e}")

    async def list_inventory(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[InventoryResponse]:
        await self.sync_master_to_inventory()
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
        query: Dict[str, Any] = {
            "$or": [
                {"status": {"$in": ["Low", "Out of Stock"]}},
                {"$expr": {"$lte": ["$totalStock", "$minStock"]}},
            ]
        }
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        cursor = self.inventory.find(query)
        alerts = []
        async for doc in cursor:
            curr = doc.get("totalStock", 0)
            reorder = doc.get("minStock", 100)
            unit = doc.get("unit", "Units")
            alerts.append({
                "id": f"alert-{doc.get('id', doc.get('_id'))}",
                "material": doc.get("name", "Unknown Material"),
                "site": doc.get("site", "Main Project Site"),
                "currentStock": curr,
                "reorderLevel": reorder,
                "unit": unit,
                "status": "Critical" if doc.get("status") == "Out of Stock" or curr <= 0 else "Low",
                "recommendation": f"Order {int(max(reorder * 2 - curr, 10))} {unit} immediately",
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
            site_val = res.get("site", "All Sites")
            mat_val = res.get("material", "Material")
            qty_val = res.get("quantity", "")
            unit_val = res.get("unit", "")
            action_verb = "accepted & approved" if status == "Approved" else "declined" if status == "Rejected" else status
            await self.log_activity(
                text=f"Material Request {res.get('requestId')}: {status} by Admin",
                subtext=f"Admin {action_verb} request for {qty_val} {unit_val} of {mat_val} at {site_val}.",
                site=site_val,
                act_type="request",
                actor="Admin",
                target_role="supervisor",
            )
            await self._persist()
            return MaterialRequestResponse(**self._doc_to_res(res))
        return None

    async def send_materials_to_supervisor(
        self,
        request_id: str,
        dispatched_qty: Optional[float] = None,
        dispatch_notes: Optional[str] = None,
        supplier_or_store: Optional[str] = "Central Warehouse / Admin",
        admin_name: str = "Admin",
        add_stock_qty: Optional[float] = None,
        supplier: Optional[str] = None,
        invoice_no: Optional[str] = None,
        unit_price: Optional[float] = None,
    ) -> Optional[MaterialRequestResponse]:
        req = await self.requests.find_one(
            {"$or": [{"id": request_id}, {"_id": request_id}, {"requestId": request_id}]}
        )
        if not req:
            return None

        qty = float(dispatched_qty) if (dispatched_qty is not None and dispatched_qty > 0) else float(req.get("quantity") or 0.0)
        site_name = req.get("site") or "Site A"
        material_name = (req.get("material") or "").strip()
        unit = req.get("unit") or "Units"
        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
        today_date = datetime.now(timezone.utc).strftime("%d-%m-%Y")
        req_id_str = req.get("requestId", request_id)
        notes = (dispatch_notes or f"Dispatched by {admin_name} against request {req_id_str}").strip()

        # Step 0: If we don't have stock or need to add stock first, restock Central Warehouse
        if add_stock_qty is not None and float(add_stock_qty) > 0:
            stock_to_add = float(add_stock_qty)
            central_item = await self.inventory.find_one({
                "name": {"$regex": f"^{re.escape(material_name)}$", "$options": "i"},
                "$or": [{"site": "Central Warehouse"}, {"site": "Central Store"}, {"site": "All Sites"}]
            })
            if central_item:
                new_central = float(central_item.get("totalStock", 0.0)) + stock_to_add
                min_s = float(central_item.get("minStock", 10.0))
                await self.inventory.update_one(
                    {"_id": central_item["_id"]},
                    {
                        "$set": {
                            "totalStock": new_central,
                            "status": _calc_stock_status(new_central, min_s),
                            "unitPrice": unit_price if unit_price is not None else central_item.get("unitPrice", 0.0),
                            "updatedAt": datetime.now(timezone.utc).isoformat(),
                        }
                    }
                )
            else:
                new_inv_id = f"inv-{uuid.uuid4().hex[:6]}"
                await self.inventory.insert_one({
                    "id": new_inv_id,
                    "_id": new_inv_id,
                    "name": material_name,
                    "category": "Others",
                    "unit": unit,
                    "totalStock": stock_to_add,
                    "minStock": 10.0,
                    "status": _calc_stock_status(stock_to_add, 10.0),
                    "site": "Central Warehouse",
                    "unitPrice": unit_price or 0.0,
                    "createdAt": now_str,
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                })

            # Record stock_in transaction for Central Warehouse restock
            await self.stock_transactions.insert_one({
                "id": f"tx-in-{uuid.uuid4().hex[:6]}",
                "site": "Central Warehouse",
                "material": material_name,
                "quantity": stock_to_add,
                "unit": unit,
                "type": "stock_in",
                "reference": invoice_no or f"Procured for Req {req_id_str}",
                "actor": supplier or "Vendor / Supplier",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "notes": f"Procured and added stock for material request {req_id_str}",
            })

        # Deduct dispatched quantity from Central Warehouse inventory if present
        central_item_after = await self.inventory.find_one({
            "name": {"$regex": f"^{re.escape(material_name)}$", "$options": "i"},
            "$or": [{"site": "Central Warehouse"}, {"site": "Central Store"}, {"site": "All Sites"}]
        })
        if central_item_after:
            cur_c_stock = float(central_item_after.get("totalStock", 0.0))
            rem_stock = max(0.0, cur_c_stock - qty)
            min_s = float(central_item_after.get("minStock", 10.0))
            await self.inventory.update_one(
                {"_id": central_item_after["_id"]},
                {
                    "$set": {
                        "totalStock": rem_stock,
                        "status": _calc_stock_status(rem_stock, min_s),
                        "updatedAt": datetime.now(timezone.utc).isoformat(),
                    }
                }
            )

        # 1. Update the Material Request status and record dispatch details
        updated_req = await self.requests.find_one_and_update(
            {"_id": req["_id"]},
            {
                "$set": {
                    "status": "Approved",
                    "dispatchedQty": qty,
                    "dispatchedOn": now_str,
                    "dispatchedBy": admin_name,
                    "dispatchNotes": notes,
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                }
            },
            return_document=True,
        )

        # 2. Record Material Outward entry for Admin (so it appears on Material Outward Page)
        outw_id = f"outw-{uuid.uuid4().hex[:6]}"
        outward_doc = {
            "id": outw_id,
            "_id": outw_id,
            "outwardId": f"OUT-{uuid.uuid4().hex[:6].upper()}",
            "date": today_date,
            "site": site_name,
            "project": site_name,
            "material": material_name,
            "natureOfWork": f"Material Request ({req_id_str}) - {req.get('purpose') or 'Dispatched to Supervisor'}",
            "quantity": qty,
            "measurement": unit,
            "createdOn": datetime.now().strftime("%d-%m-%Y %H:%M"),
            "requestedBy": req.get("requestedBy", "Site Supervisor"),
            "authorizedBy": admin_name,
            "notes": notes,
        }
        await self.material_outward.insert_one(outward_doc)

        # 3. Record stock_out in transactions ledger for Admin outward dispatch
        await self.stock_transactions.insert_one({
            "id": f"tx-{uuid.uuid4().hex[:6]}",
            "site": site_name,
            "material": material_name,
            "quantity": qty,
            "unit": unit,
            "type": "stock_out",
            "reference": req_id_str,
            "actor": admin_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"Admin outward dispatch: {qty} {unit} of {material_name} for supervisor request {req_id_str}",
        })

        # 4. Record delivery as In Transit / Dispatched to the supervisor's site
        deliv_count = await self.deliveries.count_documents({})
        deliv_id = f"DEL-2025-{deliv_count + 101:03d}"
        await self.deliveries.insert_one({
            "id": f"del-{uuid.uuid4().hex[:6]}",
            "deliveryId": deliv_id,
            "supplier": supplier_or_store or "Central Store / Admin",
            "site": site_name,
            "material": material_name,
            "expectedQty": qty,
            "receivedQty": 0,
            "unit": unit,
            "status": "In Transit",
            "expectedDate": datetime.now(timezone.utc).strftime("%d %b %Y"),
            "receivedBy": req.get("requestedBy", "Site Supervisor"),
        })

        # 5. Log activity for both Supervisor and Admin
        await self.log_activity(
            text=f"🚚 Supplies Dispatched: {qty} {unit} of {material_name}",
            subtext=f"Admin {admin_name} dispatched request {req_id_str} to {site_name}. Delivery is in transit. Please verify and record Inward receipt upon arrival.",
            site=site_name,
            act_type="dispatch",
            actor=admin_name,
            target_role="supervisor",
        )

        await self._persist()
        return MaterialRequestResponse(**self._doc_to_res(updated_req))

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
    async def log_activity(
        self,
        text: str,
        site: str,
        act_type: str = "request",
        subtext: Optional[str] = None,
        actor: Optional[str] = None,
        target_role: Optional[str] = None,
        words: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            act_id = f"act-{uuid.uuid4().hex[:6]}"
            now_str = datetime.now(timezone.utc).strftime("%d %b, %I:%M %p")
            doc = {
                "_id": act_id,
                "id": act_id,
                "text": text,
                "subtext": subtext,
                "site": site,
                "time": now_str,
                "type": act_type,
                "actor": actor or ("Admin" if target_role == "supervisor" else "Supervisor"),
                "targetRole": target_role or "all",
                "words": words,
                "status": "unread",
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
            await self.activities.insert_one(doc)
            return self._doc_to_res(doc)
        except Exception as exc:
            logger.warning("Could not log activity: %s", exc)
            return {}

    async def list_activities(
        self,
        site: Optional[str] = None,
        limit: int = 50,
        allowed_sites: Optional[List[str]] = None,
        role: Optional[str] = None,
    ) -> List[ActivityResponse]:
        query: Dict[str, Any] = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []

        if role == "supervisor":
            query["$or"] = [
                {"targetRole": {"$in": ["supervisor", "all"]}},
                {"actor": "Admin"},
            ]
        elif role == "admin":
            query["$or"] = [
                {"targetRole": {"$in": ["admin", "all"]}},
                {"actor": {"$in": ["Supervisor", "Site Supervisor", "Admin"]}},
            ]

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

    # -----------------------------------------------------------------------
    # Real-Time Reports Generation & CSV Export
    # -----------------------------------------------------------------------
    async def generate_report(
        self,
        report_type: str,
        site: Optional[str] = None,
        allowed_sites: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Generate structured live report data queried directly from database."""
        clean_type = (report_type or "").lower().replace("_", "-").strip()
        generated_at = datetime.now(timezone.utc).isoformat()

        if clean_type in ("daily-stock", "stock", "inventory"):
            items = await self.list_inventory(site, allowed_sites=allowed_sites)
            headers = [
                "Material Name",
                "Category",
                "Site",
                "Current Stock",
                "Unit",
                "Min Required",
                "Stock Status",
                "Est. Unit Price (INR)",
                "Est. Total Value (INR)",
            ]
            rows = []
            total_val = 0.0
            pricing_table = {
                "cement": 380,
                "steel": 65000,
                "sand": 2200,
                "bricks": 9,
                "paint": 450,
                "gravel": 1800,
                "aggregate": 1800,
                "finishing": 1200,
                "masonry": 850,
            }
            for item in items:
                cat_key = (item.category or "").lower()
                unit_price = pricing_table.get(cat_key, 250)
                item_val = item.totalStock * unit_price
                total_val += item_val
                rows.append([
                    item.name,
                    item.category,
                    item.site,
                    str(item.totalStock),
                    item.unit,
                    str(item.minStock),
                    item.status,
                    str(unit_price),
                    str(round(item_val, 2)),
                ])
            return {
                "reportType": "daily-stock",
                "title": "Daily Stock Summary Report",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "totalItems": len(items),
                    "totalValuation": round(total_val, 2),
                    "formattedValuation": _format_inr(total_val),
                    "lowStockCount": sum(1 for i in items if i.status in ("Low", "Out of Stock")),
                },
            }

        elif clean_type in ("material-movement", "inward-outward", "movement"):
            headers = [
                "Date",
                "Transaction Type",
                "Material Item / Work",
                "Site",
                "Quantity & Unit",
                "Transaction Details",
                "Authority",
            ]
            rows = []
            stock_in_count = 0
            stock_out_count = 0

            # 1. Real Inward material records
            inw_query: Dict[str, Any] = {}
            if site and site != "All Sites":
                inw_query["$or"] = [{"site": site}, {"project": site}]
            inw_cursor = self.material_inward.find(inw_query).sort("createdOn", -1)
            async for item in inw_cursor:
                stock_in_count += 1
                rows.append([
                    item.get("date") or item.get("createdOn", ""),
                    "Material Inward",
                    item.get("material", "N/A"),
                    item.get("site") or item.get("project", "Site A"),
                    f"{item.get('quantity', 0)} {item.get('measurement', 'Units')}",
                    f"Entry: {item.get('entryCode', '')} | Valuation: ₹{item.get('totalValue', 0)}",
                    "Supervisor",
                ])

            # 2. Real Outward material records
            out_query: Dict[str, Any] = {}
            if site and site != "All Sites":
                out_query["$or"] = [{"site": site}, {"project": site}]
            out_cursor = self.material_outward.find(out_query).sort("createdOn", -1)
            async for item in out_cursor:
                stock_out_count += 1
                rows.append([
                    item.get("date") or item.get("createdOn", ""),
                    "Material Outward",
                    item.get("natureOfWork", "Dispatched"),
                    item.get("site") or item.get("project", "Site A"),
                    f"{item.get('quantity', 0)} {item.get('measurement', 'Units')}",
                    f"Project: {item.get('project', '')} | Work: {item.get('natureOfWork', '')}",
                    "Supervisor",
                ])

            # 3. Stock transactions
            tx_query: Dict[str, Any] = {}
            if site and site != "All Sites":
                tx_query["site"] = site
            tx_cursor = self.stock_transactions.find(tx_query).sort("timestamp", -1)
            async for tx in tx_cursor:
                ref = tx.get("reference", "")
                if ref and any(ref in r[5] for r in rows):
                    continue
                tx_type = "Stock In" if tx.get("type") == "stock_in" else "Stock Out"
                if tx.get("type") == "stock_in":
                    stock_in_count += 1
                else:
                    stock_out_count += 1
                rows.append([
                    (tx.get("timestamp", "") or "")[:10],
                    tx_type,
                    tx.get("material", ""),
                    tx.get("site", ""),
                    f"{tx.get('quantity', 0)} {tx.get('unit', '')}",
                    tx.get("notes") or ref,
                    tx.get("actor", "Supervisor"),
                ])

            return {
                "reportType": "material-movement",
                "title": "Material Inward & Outward Movement Audit",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "totalTransactions": len(rows),
                    "stockInCount": stock_in_count,
                    "stockOutCount": stock_out_count,
                },
            }

        elif clean_type in ("consumption-requests", "material-requests", "requests"):
            reqs = await self.list_requests(site, allowed_sites=allowed_sites)
            headers = [
                "Request ID",
                "Site Name",
                "Requested Material",
                "Quantity",
                "Unit",
                "Urgency",
                "Status",
                "Required Date",
                "Created Date",
            ]
            rows = []
            for r in reqs:
                rows.append([
                    r.id,
                    r.site,
                    r.material,
                    str(r.quantity),
                    r.unit,
                    r.urgency,
                    r.status,
                    r.requiredDate or "Immediate",
                    r.createdAt or "",
                ])
            return {
                "reportType": "consumption-requests",
                "title": "Material Consumption & Indent Requests",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "totalRequests": len(reqs),
                    "pending": sum(1 for r in reqs if r.status == "Pending"),
                    "approved": sum(1 for r in reqs if r.status == "Approved"),
                    "rejected": sum(1 for r in reqs if r.status == "Rejected"),
                },
            }

        elif clean_type in ("vendor-deliveries", "deliveries", "vendors"):
            delivs = await self.list_deliveries(site, allowed_sites=allowed_sites)
            headers = [
                "Challan ID",
                "Supplier / Vendor",
                "Project Site",
                "Material",
                "Expected Qty",
                "Received Qty",
                "Unit",
                "Vehicle No",
                "Arrival Date",
                "Status",
            ]
            rows = []
            for d in delivs:
                rows.append([
                    d.id,
                    d.supplier,
                    d.site,
                    d.material,
                    str(d.expectedQty),
                    str(d.receivedQty),
                    d.unit,
                    d.vehicleNo or "N/A",
                    d.deliveryDate or "",
                    d.status,
                ])
            return {
                "reportType": "vendor-deliveries",
                "title": "Vendor Consignments & Delivery Performance",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "totalDeliveries": len(delivs),
                    "receivedCount": sum(1 for d in delivs if d.status == "Received"),
                    "inTransitCount": sum(1 for d in delivs if d.status in ("In Transit", "Expected")),
                },
            }

        elif clean_type in ("site-valuation", "sites", "valuation"):
            sites_list = await self.list_sites()
            if allowed_sites is not None:
                sites_list = [s for s in sites_list if s.name in allowed_sites]
            if site and site != "All Sites":
                sites_list = [s for s in sites_list if s.name == site]
            headers = [
                "Site Code",
                "Site Name",
                "Location",
                "Project Classification",
                "Assigned Supervisor",
                "Status",
                "Materials Count",
                "Estimated Stock Value (INR)",
            ]
            rows = []
            total_val = sum(s.stockValue for s in sites_list)
            for s in sites_list:
                rows.append([
                    s.code,
                    s.name,
                    s.location,
                    s.projectType or "Residential",
                    s.supervisor or "Unassigned",
                    s.status,
                    str(s.totalMaterials),
                    str(round(s.stockValue, 2)),
                ])
            return {
                "reportType": "site-valuation",
                "title": "Site-wise Inventory Valuation Breakdown",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "totalSites": len(sites_list),
                    "totalPortfolioValue": round(total_val, 2),
                    "formattedPortfolioValue": _format_inr(total_val),
                },
            }

        elif clean_type in ("low-stock", "alerts"):
            items = await self.list_inventory(site, allowed_sites=allowed_sites)
            low_items = [i for i in items if i.status in ("Low", "Out of Stock")]
            headers = [
                "Material Name",
                "Category",
                "Site",
                "Current Stock",
                "Minimum Safe Buffer",
                "Shortfall Deficit",
                "Unit",
                "Alert Severity",
            ]
            rows = []
            for i in low_items:
                shortfall = max(0, i.minStock - i.totalStock)
                rows.append([
                    i.name,
                    i.category,
                    i.site,
                    str(i.totalStock),
                    str(i.minStock),
                    str(shortfall),
                    i.unit,
                    "CRITICAL: Out of Stock" if i.totalStock <= 0 else "WARNING: Below Buffer",
                ])
            return {
                "reportType": "low-stock",
                "title": "Low Stock Material Safety Statement",
                "generatedAt": generated_at,
                "site": site or "All Sites",
                "headers": headers,
                "rows": rows,
                "summary": {
                    "criticalCount": len(low_items),
                    "affectedSites": len(set(i.site for i in low_items)),
                },
            }

        else:
            # Fallback to general stock summary
            return await self.generate_report("daily-stock", site, allowed_sites)

    async def generate_report_csv(
        self,
        report_type: str,
        site: Optional[str] = None,
        allowed_sites: Optional[List[str]] = None,
    ) -> str:
        """Generate formatted RFC 4180 CSV string for download."""
        data = await self.generate_report(report_type, site, allowed_sites)
        output = io.StringIO()
        writer = csv.writer(output)

        # Metadata banner
        writer.writerow(["ANAND HOMES CONSTRUCTION MANAGEMENT PLATFORM"])
        writer.writerow(["Report:", data.get("title", "Report")])
        writer.writerow(["Scope:", data.get("site", "All Sites")])
        writer.writerow(["Generated At:", data.get("generatedAt", "")])
        writer.writerow([])

        # Table data
        writer.writerow(data.get("headers", []))
        for row in data.get("rows", []):
            writer.writerow(row)

        writer.writerow([])
        writer.writerow(["--- SUMMARY ---"])
        summary = data.get("summary", {})
        for k, v in summary.items():
            writer.writerow([k, str(v)])

        return output.getvalue()

    # -----------------------------------------------------------------------
    # Key Screens: 1 & 2. Project Master
    # -----------------------------------------------------------------------
    async def list_projects_master(self) -> List[Dict[str, Any]]:
        cursor = self.projects_master.find({})
        docs = await cursor.to_list(length=200)
        return [self._doc_to_res(d) for d in docs]

    async def create_project_master(self, data: ProjectMasterCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"proj-{uuid.uuid4().hex[:6]}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y")
        if not item_dict.get("status"):
            item_dict["status"] = "Active"
        await self.projects_master.insert_one(item_dict)

        # Synchronize with sites collection for system-wide recognition
        site_name = (item_dict.get("siteName") or "").strip()
        project_name = (item_dict.get("projectName") or "").strip()
        if site_name:
            existing = await self.sites.find_one({"name": site_name})
            if not existing:
                site_code = f"PRJ-{project_name[:3].upper() if len(project_name) >= 3 else 'STE'}-{uuid.uuid4().hex[:3].upper()}"
                await self.sites.insert_one({
                    "id": f"site-{uuid.uuid4().hex[:6]}",
                    "name": site_name,
                    "code": site_code,
                    "location": f"{site_name}, {project_name}",
                    "projectType": project_name,
                    "status": "Active",
                    "totalMaterials": 0,
                    "lowStockCount": 0,
                    "stockValue": 0.0,
                    "stockValueFormatted": "₹0",
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                })
        await self.log_activity(
            text=f"Project Setup: {project_name} - {site_name}",
            subtext=f"Status: {item_dict.get('status', 'Active')}",
            site=site_name,
            act_type="delivery",
            actor="Admin",
            target_role="supervisor",
        )
        await self._persist()
        return self._doc_to_res(item_dict)

    async def update_project_master(self, project_id: str, data: ProjectMasterUpdate) -> Optional[Dict[str, Any]]:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            doc = await self.projects_master.find_one({"$or": [{"id": project_id}, {"_id": project_id}]})
            return self._doc_to_res(doc)
        await self.projects_master.update_one({"$or": [{"id": project_id}, {"_id": project_id}]}, {"$set": update_data})
        await self._persist()
        doc = await self.projects_master.find_one({"$or": [{"id": project_id}, {"_id": project_id}]})
        return self._doc_to_res(doc)

    async def delete_project_master(self, project_id: str) -> bool:
        res = await self.projects_master.delete_one({"$or": [{"id": project_id}, {"_id": project_id}]})
        await self._persist()
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Key Screens: 3. Supervisor Master
    # -----------------------------------------------------------------------
    async def list_supervisors_master(self) -> List[Dict[str, Any]]:
        cursor = self.supervisors_master.find({})
        docs = await cursor.to_list(length=200)
        return [self._doc_to_res(d) for d in docs]

    async def create_supervisor_master(self, data: SupervisorMasterCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"sup-{uuid.uuid4().hex[:6]}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y")
        await self.supervisors_master.insert_one(item_dict)

        # 1. Automatic User Account Creation / Sync in db["users"]
        raw_login = data.loginId.strip().lower()
        email_clean = raw_login if "@" in raw_login else f"{raw_login}@anandhomes.com"
        from app.core.security import hash_password

        # Check if user already exists
        existing_user = await self.db["users"].find_one({
            "$or": [
                {"email": email_clean},
                {"login_id": raw_login},
                {"username": raw_login},
            ]
        })
        user_id = str(uuid.uuid4())
        pwd_hash = hash_password(data.password)

        if not existing_user:
            user_doc = {
                "_id": user_id,
                "id": user_id,
                "name": data.name.strip(),
                "email": email_clean,
                "login_id": raw_login,
                "password_hash": pwd_hash,
                "role": "supervisor",
                "assigned_site": data.site,
                "assigned_project": data.project,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            await self.db["users"].insert_one(user_doc)
        else:
            user_id = str(existing_user.get("id") or existing_user.get("_id"))
            await self.db["users"].update_one(
                {"$or": [{"_id": user_id}, {"id": user_id}]},
                {"$set": {
                    "name": data.name.strip(),
                    "password_hash": pwd_hash,
                    "role": "supervisor",
                    "assigned_site": data.site,
                    "assigned_project": data.project,
                    "is_active": True,
                    "updated_at": datetime.now(timezone.utc),
                }}
            )

        # 2. Assign Site to Supervisor in db["sites"]
        site_doc = await self.sites.find_one({"name": data.site})
        if site_doc:
            await self.sites.update_one(
                {"_id": site_doc["_id"]},
                {"$set": {
                    "supervisor": data.name.strip(),
                    "supervisorEmail": email_clean,
                    "supervisorId": user_id,
                    "project": data.project,
                }}
            )
        else:
            new_site_doc = {
                "_id": f"site-{uuid.uuid4().hex[:6]}",
                "id": f"site-{uuid.uuid4().hex[:6]}",
                "name": data.site,
                "code": f"SITE-{uuid.uuid4().hex[:4].upper()}",
                "location": data.project or "On-Site",
                "status": "Active",
                "supervisor": data.name.strip(),
                "supervisorEmail": email_clean,
                "supervisorId": user_id,
                "project": data.project,
                "stockValue": 0,
                "stockValueFormatted": "₹0",
                "totalMaterials": 0,
                "pendingRequests": 0,
                "lastDelivery": "No deliveries yet",
                "lastUpdated": datetime.now().strftime("%d %b %Y"),
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
            await self.sites.insert_one(new_site_doc)

        # 3. Log Activity / Notification for both Admin & Supervisor
        await self.log_activity(
            text=f"Supervisor Assigned: {data.name} assigned to Site '{data.site}'",
            subtext=f"Project: {data.project} | Login ID: {data.loginId} | Role: Site Supervisor",
            site=data.site,
            act_type="request",
            actor="Admin",
            target_role="supervisor",
        )

        await self._persist()
        return self._doc_to_res(item_dict)

    async def update_supervisor_master(self, supervisor_id: str, data: SupervisorMasterUpdate) -> Optional[Dict[str, Any]]:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            doc = await self.supervisors_master.find_one({"$or": [{"id": supervisor_id}, {"_id": supervisor_id}]})
            return self._doc_to_res(doc)
        await self.supervisors_master.update_one({"$or": [{"id": supervisor_id}, {"_id": supervisor_id}]}, {"$set": update_data})

        # Sync updates with users collection & site assignment if name/site/password changed
        doc = await self.supervisors_master.find_one({"$or": [{"id": supervisor_id}, {"_id": supervisor_id}]})
        if doc:
            user_update: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
            if "name" in update_data:
                user_update["name"] = update_data["name"]
            if "site" in update_data:
                user_update["assigned_site"] = update_data["site"]
                # Update site supervisor
                await self.sites.update_one({"name": update_data["site"]}, {"$set": {"supervisor": doc.get("name")}})
            if "project" in update_data:
                user_update["assigned_project"] = update_data["project"]
            if "password" in update_data and update_data["password"]:
                from app.core.security import hash_password
                user_update["password_hash"] = hash_password(update_data["password"])

            raw_login = doc.get("loginId", "").strip().lower()
            email_clean = raw_login if "@" in raw_login else f"{raw_login}@anandhomes.com"
            await self.db["users"].update_one(
                {"$or": [{"email": email_clean}, {"login_id": raw_login}]},
                {"$set": user_update}
            )

            await self.log_activity(
                text=f"Supervisor Updated: {doc.get('name')} for Site '{doc.get('site')}'",
                subtext=f"Project: {doc.get('project')}",
                site=doc.get("site", "All Sites"),
                act_type="request",
                actor="Admin",
                target_role="supervisor",
            )

        await self._persist()
        return self._doc_to_res(doc)

    async def delete_supervisor_master(self, supervisor_id: str) -> bool:
        doc = await self.supervisors_master.find_one({"$or": [{"id": supervisor_id}, {"_id": supervisor_id}]})
        if doc:
            raw_login = doc.get("loginId", "").strip().lower()
            email_clean = raw_login if "@" in raw_login else f"{raw_login}@anandhomes.com"
            await self.db["users"].delete_one({"$or": [{"email": email_clean}, {"login_id": raw_login}]})
            if doc.get("site"):
                await self.sites.update_one({"name": doc.get("site")}, {"$set": {"supervisor": "Unassigned"}})
        res = await self.supervisors_master.delete_one({"$or": [{"id": supervisor_id}, {"_id": supervisor_id}]})
        await self._persist()
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Key Screens: 4. Project Duration
    # -----------------------------------------------------------------------
    async def list_project_durations(self) -> List[Dict[str, Any]]:
        cursor = self.project_durations.find({})
        docs = await cursor.to_list(length=200)
        return [self._doc_to_res(d) for d in docs]

    async def create_project_duration(self, data: ProjectDurationCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"dur-{uuid.uuid4().hex[:6]}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y")
        await self.project_durations.insert_one(item_dict)
        await self._persist()
        return self._doc_to_res(item_dict)

    async def delete_project_duration(self, duration_id: str) -> bool:
        res = await self.project_durations.delete_one({"$or": [{"id": duration_id}, {"_id": duration_id}]})
        await self._persist()
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Key Screens: 5. Inventory Master
    # -----------------------------------------------------------------------
    async def list_inventory_master(self) -> List[Dict[str, Any]]:
        cursor = self.inventory_master.find({})
        docs = await cursor.to_list(length=200)
        return [self._doc_to_res(d) for d in docs]

    async def create_inventory_master(self, data: InventoryMasterCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"im-{uuid.uuid4().hex[:6]}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y")
        await self.inventory_master.insert_one(item_dict)

        # Synchronize / register directly into stock tracking (self.inventory)
        mat_name = (data.material or "").strip()
        category = data.category or "Others"
        unit = data.measurement or "Units"
        init_stock = float(data.initialStock or 0.0)
        min_stock = float(data.minStock or 10.0)

        site_names = []
        if data.site and data.site.strip() and data.site != "All Sites":
            site_names = [data.site.strip()]
        else:
            cursor = self.sites.find({})
            async for s in cursor:
                s_name = s.get("name")
                if s_name and s_name not in site_names:
                    site_names.append(s_name)
            if not site_names:
                site_names = ["Site A"]

        for s_name in site_names:
            existing = await self.inventory.find_one({
                "name": {"$regex": f"^{re.escape(mat_name)}$", "$options": "i"},
                "$or": [{"site": s_name}, {"site": "All Sites"}]
            })
            if existing:
                if init_stock > 0:
                    new_tot = float(existing.get("totalStock", 0.0)) + init_stock
                    await self.inventory.update_one(
                        {"_id": existing["_id"]},
                        {"$set": {
                            "totalStock": new_tot,
                            "status": _calc_stock_status(new_tot, float(existing.get("minStock", min_stock))),
                            "unit": unit,
                            "category": category,
                            "updatedAt": datetime.now(timezone.utc).isoformat(),
                        }}
                    )
            else:
                inv_id = f"inv-{uuid.uuid4().hex[:6]}"
                inv_doc = {
                    "id": inv_id,
                    "_id": inv_id,
                    "name": mat_name,
                    "category": category,
                    "unit": unit,
                    "totalStock": init_stock,
                    "minStock": min_stock,
                    "status": _calc_stock_status(init_stock, min_stock),
                    "site": s_name,
                    "unitPrice": 0.0,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                }
                await self.inventory.insert_one(inv_doc)

        await self._persist()
        return self._doc_to_res(item_dict)

    async def update_inventory_master(self, item_id: str, data: InventoryMasterUpdate) -> Optional[Dict[str, Any]]:
        old_doc = await self.inventory_master.find_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        old_name = (old_doc.get("material") or "").strip() if old_doc else None

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return self._doc_to_res(old_doc)

        await self.inventory_master.update_one({"$or": [{"id": item_id}, {"_id": item_id}]}, {"$set": update_data})

        # Update stock tracking items if name/category/unit changed
        if old_name:
            sync_fields: Dict[str, Any] = {}
            if data.material:
                sync_fields["name"] = data.material.strip()
            if data.category:
                sync_fields["category"] = data.category
            if data.measurement:
                sync_fields["unit"] = data.measurement
            if sync_fields:
                sync_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
                await self.inventory.update_many(
                    {"name": {"$regex": f"^{re.escape(old_name)}$", "$options": "i"}},
                    {"$set": sync_fields}
                )

        await self._persist()
        doc = await self.inventory_master.find_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        return self._doc_to_res(doc)

    async def delete_inventory_master(self, item_id: str) -> bool:
        doc = await self.inventory_master.find_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        if doc and doc.get("material"):
            mat_name = doc["material"].strip()
            # If stock is 0, also remove unstocked tracking items
            await self.inventory.delete_many({
                "name": {"$regex": f"^{re.escape(mat_name)}$", "$options": "i"},
                "totalStock": {"$lte": 0}
            })
        res = await self.inventory_master.delete_one({"$or": [{"id": item_id}, {"_id": item_id}]})
        await self._persist()
        return res.deleted_count > 0

    # -----------------------------------------------------------------------
    # Key Screens: 6. Inward Material Entry (Common)
    # -----------------------------------------------------------------------
    async def list_inward_materials(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []
        cursor = self.material_inward.find(query).sort("createdOn", -1)
        docs = await cursor.to_list(length=500)
        return [self._doc_to_res(d) for d in docs]

    async def create_inward_material(self, data: InwardMaterialCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"inw-{uuid.uuid4().hex[:6]}"
        # Generate unique entry code as specified in diagram: e.g. INW-YYYYMMDD-XXXX
        today_str = datetime.now().strftime("%Y%m%d")
        suffix = uuid.uuid4().hex[:4].upper()
        item_dict["entryCode"] = f"INW-{today_str}-{suffix}"
        
        # Calculate auto unit price: totalValue / quantity
        qty = float(item_dict.get("quantity") or 1.0)
        total_val = float(item_dict.get("totalValue") or 0.0)
        unit_price = round(total_val / qty, 2) if qty > 0 else 0.0
        item_dict["unitPrice"] = unit_price
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y %H:%M")

        await self.material_inward.insert_one(item_dict)

        # Ensure material is added or updated directly in inventory collection
        site_name = item_dict.get("site") or item_dict.get("project") or "Site A"
        mat_name = (item_dict.get("material") or "").strip()
        category = item_dict.get("category") or "Others"
        unit = item_dict.get("measurement") or "Units"

        existing_item = await self.inventory.find_one({
            "name": {"$regex": f"^{re.escape(mat_name)}$", "$options": "i"},
            "$or": [{"site": site_name}, {"site": "All Sites"}, {"site": {"$exists": False}}]
        })

        if existing_item:
            new_stock = float(existing_item.get("totalStock", 0)) + qty
            min_s = float(existing_item.get("minStock", 10.0))
            await self.inventory.update_one(
                {"_id": existing_item["_id"]},
                {
                    "$set": {
                        "totalStock": new_stock,
                        "status": _calc_stock_status(new_stock, min_s),
                        "unit": unit or existing_item.get("unit", "Units"),
                        "category": category or existing_item.get("category", "Others"),
                        "unitPrice": unit_price or existing_item.get("unitPrice", 0.0),
                        "site": site_name,
                        "updatedAt": datetime.now(timezone.utc).isoformat(),
                    }
                }
            )
        else:
            inv_id = f"inv-{uuid.uuid4().hex[:6]}"
            inv_doc = {
                "id": inv_id,
                "_id": inv_id,
                "name": mat_name,
                "category": category,
                "unit": unit,
                "totalStock": qty,
                "minStock": 10.0,
                "status": _calc_stock_status(qty, 10.0),
                "site": site_name,
                "unitPrice": unit_price,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
            await self.inventory.insert_one(inv_doc)

        # Record in stock_transactions audit ledger
        await self.stock_transactions.insert_one({
            "id": f"tx-{uuid.uuid4().hex[:6]}",
            "site": site_name,
            "material": mat_name,
            "quantity": qty,
            "unit": unit,
            "type": "stock_in",
            "reference": item_dict.get("entryCode"),
            "actor": "Supervisor",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"Material Inward Entry: {item_dict.get('entryCode')}",
            "unitPrice": unit_price,
            "totalValue": total_val,
        })

        # Recalculate site totalMaterials and stockValue
        site_inv = await self.inventory.find({"site": site_name}).to_list(length=300)
        total_mats = len(site_inv)
        site_val = sum(float(i.get("totalStock", 0)) * float(i.get("unitPrice", 0) or 250) for i in site_inv)
        await self.sites.update_one(
            {"$or": [{"name": site_name}, {"id": site_name}]},
            {"$set": {
                "totalMaterials": total_mats,
                "stockValue": site_val,
                "stockValueFormatted": _format_inr(site_val),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }}
        )

        site_display = site_name or "On-Site"
        # Log Activity to Admin
        await self.log_activity(
            text=f"Material Inward: Received {qty} of {item_dict.get('material')} at {site_display}",
            subtext=f"Entry Code: {item_dict.get('entryCode')} | Total Value: ₹{total_val}",
            site=site_display,
            act_type="stock_in",
            actor="Supervisor",
            target_role="admin",
        )

        await self._persist()
        return self._doc_to_res(item_dict)

    # -----------------------------------------------------------------------
    # Key Screens: 7. Outward Material Entry
    # -----------------------------------------------------------------------
    async def list_outward_materials(
        self, site: Optional[str] = None, allowed_sites: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {}
        if not self._apply_site_filter(query, site, allowed_sites):
            return []
        cursor = self.material_outward.find(query).sort("createdOn", -1)
        docs = await cursor.to_list(length=500)
        return [self._doc_to_res(d) for d in docs]

    async def create_outward_material(self, data: OutwardMaterialCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"outw-{uuid.uuid4().hex[:6]}"
        item_dict["outwardId"] = item_dict.get("outwardId") or f"OUT-{uuid.uuid4().hex[:6].upper()}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y %H:%M")
        qty = float(item_dict.get("quantity") or 0.0)
        site_name = item_dict.get("site") or item_dict.get("project") or "Site A"
        work_or_mat = (item_dict.get("material") or item_dict.get("natureOfWork") or "").strip()
        if not item_dict.get("natureOfWork"):
            item_dict["natureOfWork"] = work_or_mat
        if not item_dict.get("material"):
            item_dict["material"] = work_or_mat
        if not item_dict.get("measurement") and item_dict.get("unit"):
            item_dict["measurement"] = item_dict["unit"]

        await self.material_outward.insert_one(item_dict)

        # Decrement stock in inventory if matching material item found
        inv_match = await self.inventory.find_one({
            "$and": [
                {
                    "$or": [
                        {"name": {"$regex": f"^{re.escape(work_or_mat)}$", "$options": "i"}},
                        {"category": {"$regex": f"^{re.escape(work_or_mat)}$", "$options": "i"}},
                    ]
                },
                {
                    "$or": [{"site": site_name}, {"site": "All Sites"}]
                }
            ]
        })
        if inv_match:
            cur_stock = float(inv_match.get("totalStock", 0))
            new_stock = max(0.0, cur_stock - qty)
            min_s = float(inv_match.get("minStock", 10.0))
            await self.inventory.update_one(
                {"_id": inv_match["_id"]},
                {
                    "$set": {
                        "totalStock": new_stock,
                        "status": _calc_stock_status(new_stock, min_s),
                        "updatedAt": datetime.now(timezone.utc).isoformat(),
                    }
                }
            )

        # Record in stock_transactions audit ledger
        await self.stock_transactions.insert_one({
            "id": f"tx-{uuid.uuid4().hex[:6]}",
            "site": site_name,
            "material": work_or_mat,
            "quantity": qty,
            "unit": item_dict.get("measurement") or item_dict.get("unit") or "Units",
            "type": "stock_out",
            "reference": item_dict["id"],
            "actor": item_dict.get("authorizedBy") or "Admin User",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"Material Outward: {work_or_mat} for {item_dict.get('project') or site_name}",
        })

        # Log Activity to Admin
        await self.log_activity(
            text=f"Material Outward: Dispatched {qty} {item_dict.get('measurement')} at {item_dict.get('site')}",
            subtext=f"Project: {item_dict.get('project')} | Work: {item_dict.get('natureOfWork')}",
            site=item_dict.get("site", "On-Site"),
            act_type="stock_out",
            actor="Supervisor",
            target_role="admin",
        )

        await self._persist()
        return self._doc_to_res(item_dict)

    # -----------------------------------------------------------------------
    # Key Screens: 8. Labour Entry
    # -----------------------------------------------------------------------
    async def list_labour_entries(self) -> List[Dict[str, Any]]:
        cursor = self.labour_entries.find({}).sort("createdOn", -1)
        docs = await cursor.to_list(length=200)
        return [self._doc_to_res(d) for d in docs]

    async def create_labour_entry(self, data: LabourEntryCreate) -> Dict[str, Any]:
        item_dict = data.model_dump()
        item_dict["id"] = f"lab-{uuid.uuid4().hex[:6]}"
        item_dict["createdOn"] = datetime.now().strftime("%d-%m-%Y %H:%M")
        await self.labour_entries.insert_one(item_dict)

        # Log Activity to Admin
        total_workers = sum([
            int(item_dict.get("masons") or 0),
            int(item_dict.get("helpers") or 0),
            int(item_dict.get("carpenters") or 0),
            int(item_dict.get("barBenders") or 0),
            int(item_dict.get("electricians") or 0),
            int(item_dict.get("plumbers") or 0),
        ])
        await self.log_activity(
            text=f"Daily Labour Entry: {total_workers} workers at {item_dict.get('site')}",
            subtext=f"Project: {item_dict.get('project')} | Work: {item_dict.get('natureOfWork')} | Date: {item_dict.get('date')}",
            site=item_dict.get("site", "On-Site"),
            act_type="request",
            actor="Supervisor",
            target_role="admin",
        )

        await self._persist()
        return self._doc_to_res(item_dict)

    async def delete_labour_entry(self, entry_id: str) -> bool:
        res = await self.labour_entries.delete_one({"$or": [{"id": entry_id}, {"_id": entry_id}]})
        await self._persist()
        return res.deleted_count > 0
