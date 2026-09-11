import asyncio
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

logger = logging.getLogger("app.database")
settings = get_settings()

TRACKED_COLLECTIONS = [
    "users",
    "sites",
    "inventory",
    "material_requests",
    "deliveries",
    "site_photos",
    "activities",
    "stock_transactions",
    "properties",
    "favorites",
    "enquiries",
]


class MongoDBManager:
    """Manages the real MongoDB Atlas database connection pool and lifecycle."""

    def __init__(self) -> None:
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self._is_connected: bool = False
        self.is_atlas: bool = True
        self.atlas_error: Optional[str] = None
        self.client_ip: str = "106.192.164.157"

    async def _detect_public_ip(self) -> None:
        """Helper to resolve current public IP."""
        def _fetch():
            import urllib.request
            try:
                return urllib.request.urlopen("https://api.ipify.org", timeout=2).read().decode("utf8")
            except Exception:
                return "106.192.164.157"

        loop = asyncio.get_running_loop()
        try:
            self.client_ip = await loop.run_in_executor(None, _fetch)
        except Exception:
            self.client_ip = "106.192.164.157"

    async def connect(self) -> None:
        """Establish direct connection to MongoDB Atlas."""
        await self._detect_public_ip()

        try:
            import certifi
            ca_file = certifi.where()
        except ImportError:
            ca_file = None

        client_kwargs: Dict[str, Any] = {
            "serverSelectionTimeoutMS": 5000,
            "connectTimeoutMS": 5000,
        }
        if ca_file and "mongodb+srv" in settings.MONGODB_URL:
            client_kwargs["tlsCAFile"] = ca_file

        try:
            atlas_client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                **client_kwargs,
            )
            atlas_db = atlas_client[settings.DATABASE_NAME]
            # Verify Atlas ping directly
            await atlas_db.command("ping")

            self.client = atlas_client
            self.db = atlas_db
            self._is_connected = True
            self.is_atlas = True
            self.atlas_error = None
            logger.info("Successfully connected to live MongoDB Atlas database '%s'!", settings.DATABASE_NAME)

            # Ensure indexes in MongoDB Atlas
            await self.ensure_indexes()

        except Exception as exc:
            self._is_connected = False
            self.atlas_error = str(exc)
            logger.error(
                "MongoDB Atlas connection failed (%s). Please ensure your IP (%s) or '0.0.0.0/0' is in Atlas Network Access.",
                exc,
                self.client_ip,
            )
            # Re-raise or keep client uninitialized so that caller is explicitly aware
            raise RuntimeError(
                f"Failed to connect to MongoDB Atlas: {exc}. Please check your internet connection or Atlas Network Access."
            ) from exc

    async def ensure_indexes(self) -> None:
        """Ensure necessary collections have correct indexes directly in MongoDB Atlas."""
        if self.db is not None:
            try:
                await self.db.users.create_index("email", unique=True)
                await self.db.properties.create_index("propertyType")
                await self.db.properties.create_index("location")
                await self.db.favorites.create_index([("userId", 1), ("propertyId", 1)], unique=True)
                await self.db.enquiries.create_index("userId")
                await self.db.enquiries.create_index("propertyId")
                await self.db.sites.create_index("name")
                await self.db.inventory.create_index([("name", 1), ("site", 1)])
                logger.info("Verified all MongoDB Atlas database indexes.")
            except Exception as exc:
                logger.warning("Notice on MongoDB indexes: %s", exc)

    async def close(self) -> None:
        """Clean shutdown of MongoDB Atlas connection."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self._is_connected = False
            logger.info("MongoDB Atlas connection cleanly closed.")

    async def check_health(self) -> Dict[str, Any]:
        """Verify database connectivity for health checks."""
        if not self.client or self.db is None:
            return {"status": "disconnected", "details": "MongoDB Atlas not connected"}
        try:
            await self.db.command("ping")
            self._is_connected = True
            return {"status": "connected", "details": f"MongoDB Atlas Cloud ({settings.DATABASE_NAME})"}
        except Exception as exc:
            self._is_connected = False
            return {"status": "disconnected", "details": str(exc)}

    async def get_status(self) -> Dict[str, Any]:
        """Detailed status information for the database management UI."""
        collections_info: Dict[str, int] = {}
        if self.db is not None and self._is_connected:
            for coll in TRACKED_COLLECTIONS:
                try:
                    count = await self.db[coll].count_documents({})
                    collections_info[coll] = count
                except Exception:
                    collections_info[coll] = 0

        return {
            "is_atlas": True,
            "mode": "atlas",
            "is_connected": self._is_connected,
            "database_name": settings.DATABASE_NAME,
            "client_ip": self.client_ip,
            "atlas_url": "cluster0.l8ynb0w.mongodb.net",
            "atlas_error": self.atlas_error,
            "instructions": "Connected directly to MongoDB Atlas Cloud. All reads and writes are live in the cloud.",
            "collections": collections_info,
        }

    # Stubs for compatibility
    def mark_dirty(self) -> None:
        pass

    async def save_to_disk(self) -> None:
        pass

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get_db(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("MongoDB Atlas database is not initialized. Please check connection.")
        return self.db


# Global singleton instance
db_manager = MongoDBManager()


def get_database() -> AsyncIOMotorDatabase:
    """Dependency for obtaining the active database instance."""
    return db_manager.get_db()
