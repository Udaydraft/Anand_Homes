import logging
from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

logger = logging.getLogger("app.database")
settings = get_settings()


class MongoDBManager:
    """Manages the MongoDB connection pool and database lifecycle."""

    def __init__(self) -> None:
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self._is_connected: bool = False

    async def connect(self) -> None:
        """Establish connection to MongoDB and ensure indexes exist."""
        try:
            logger.info("Connecting to MongoDB at %s...", settings.MONGODB_URL.split("@")[-1])
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
            )
            self.db = self.client[settings.DATABASE_NAME]
            # Verify connectivity
            await self.db.command("ping")
            self._is_connected = True
            logger.info("Successfully connected to MongoDB database '%s'", settings.DATABASE_NAME)
            
            # Ensure indexes
            await self.ensure_indexes()
        except Exception as exc:
            self._is_connected = False
            logger.warning(
                "MongoDB connection could not be established at startup: %s. "
                "The app will continue running, and health check will report database status.",
                str(exc),
            )

    async def ensure_indexes(self) -> None:
        """Ensure necessary collections have correct indexes."""
        if self.db is not None:
            try:
                # Unique index on user email
                await self.db.users.create_index("email", unique=True)
                logger.info("Verified unique index on 'users.email'")
            except Exception as exc:
                logger.warning("Error creating MongoDB indexes: %s", exc)

    async def close(self) -> None:
        """Close MongoDB connection cleanly."""
        if self.client:
            logger.info("Closing MongoDB connection...")
            self.client.close()
            self.client = None
            self.db = None
            self._is_connected = False
            logger.info("MongoDB connection closed.")

    async def check_health(self) -> Dict[str, Any]:
        """Verify database connectivity for health checks."""
        if not self.client or self.db is None:
            return {"status": "disconnected", "details": "Client not initialized"}
        try:
            await self.db.command("ping")
            self._is_connected = True
            return {"status": "connected", "details": f"Database: {settings.DATABASE_NAME}"}
        except Exception as exc:
            self._is_connected = False
            return {"status": "disconnected", "details": str(exc)}

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get_db(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("Database is not initialized. Please check MongoDB configuration.")
        return self.db


# Global singleton instance
db_manager = MongoDBManager()


def get_database() -> AsyncIOMotorDatabase:
    """Dependency for obtaining the active database instance."""
    return db_manager.get_db()
