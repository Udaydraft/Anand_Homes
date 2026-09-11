from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserModel
from app.schemas.user import UserProfileUpdateRequest, UserResponse


class UserService:
    """Handles business logic and database queries for user management."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.collection = db["users"]

    async def list_users(self, role: Optional[str] = None) -> List[UserResponse]:
        """Fetch all registered users, optionally filtered by role."""
        query: Dict[str, Any] = {}
        if role:
            query["role"] = role.lower().strip()

        cursor = self.collection.find(query)
        docs = await cursor.to_list(1000)
        users = [UserModel.from_mongo(d) for d in docs]
        return [self.to_response(u) for u in users]

    async def get_by_id(self, user_id: str) -> Optional[UserModel]:
        """Fetch a single user document by ID."""
        doc = await self.collection.find_one({"$or": [{"_id": user_id}, {"id": user_id}]})
        if not doc:
            return None
        return UserModel.from_mongo(doc)

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        """Fetch a single user document by email (case-insensitive)."""
        doc = await self.collection.find_one({"email": email.lower().strip()})
        if not doc:
            return None
        return UserModel.from_mongo(doc)

    async def update_profile(
        self, user_id: str, update_data: UserProfileUpdateRequest
    ) -> Optional[UserModel]:
        """Update user profile fields."""
        update_fields: Dict[str, Any] = {}
        if update_data.name is not None:
            update_fields["name"] = update_data.name.strip()

        if not update_fields:
            return await self.get_by_id(user_id)

        update_fields["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"$or": [{"_id": user_id}, {"id": user_id}]},
            {"$set": update_fields},
            return_document=True,
        )
        if not result:
            return None

        # Ensure persistence
        try:
            from app.database.mongodb import db_manager
            db_manager.mark_dirty()
            await db_manager.save_to_disk()
        except Exception:
            pass

        return UserModel.from_mongo(result)

    @staticmethod
    def to_response(user: UserModel) -> UserResponse:
        """Convert UserModel to public UserResponse schema."""
        normalized_role = "admin" if (user.role == "admin" or "admin@" in user.email) else "supervisor"
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=normalized_role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
