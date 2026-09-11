import asyncio
import logging
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import hash_password
from app.database.mongodb import db_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("seed")


async def seed_database() -> None:
    """
    Ensure the two primary real user credentials exist (Admin and Supervisor)
    and clean any artificial dummy data so the user can use the app with real data.
    """
    logger.info("Connecting to database...")
    await db_manager.connect()
    db: AsyncIOMotorDatabase = db_manager.get_db()

    logger.info("Configuring AnandHomes authentication in '%s'...", db.name)

    # 1. Clean dummy collections so user starts with real operational data
    collections_to_clean = [
        "properties",
        "favorites",
        "enquiries",
        "sites",
        "inventory",
        "material_requests",
        "deliveries",
        "site_photos",
        "activities",
        "stock_transactions",
    ]
    for coll_name in collections_to_clean:
        await db[coll_name].delete_many({})
        logger.info("✓ Cleared collection '%s' for real data use.", coll_name)

    # 2. Ensure only the two primary real logins exist: Admin and Supervisor
    users_coll = db["users"]
    default_password_hash = hash_password("Password@123")

    real_users = [
        {
            "_id": "USER-ADMIN-01",
            "id": "USER-ADMIN-01",
            "name": "Admin User",
            "email": "admin@anandhomes.com",
            "password_hash": default_password_hash,
            "role": "admin",
            "is_active": True,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
        {
            "_id": "USER-SUPERVISOR-01",
            "id": "USER-SUPERVISOR-01",
            "name": "Rajesh Kumar",
            "email": "rajesh.k@anandhomes.com",
            "password_hash": default_password_hash,
            "role": "supervisor",
            "is_active": True,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
    ]

    for u in real_users:
        await users_coll.update_one({"email": u["email"]}, {"$set": u}, upsert=True)
    
    # Remove any client/buyer accounts
    await users_coll.delete_many({"role": {"$nin": ["admin", "supervisor"]}})
    await users_coll.delete_many({"email": "client@anandhomes.com"})

    logger.info("✓ Verified 2 real accounts: Admin (admin@anandhomes.com) & Supervisor (rajesh.k@anandhomes.com).")
    logger.info("🎉 Database cleaned and prepared for real data operations!")

    await db_manager.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
