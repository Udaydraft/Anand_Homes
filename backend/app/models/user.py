from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid


class UserModel:
    """Represents a User entity in the MongoDB database layer."""

    def __init__(
        self,
        name: str,
        email: str,
        password_hash: str,
        role: str = "user",
        is_active: bool = True,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.email = email.lower().strip()
        self.password_hash = password_hash
        self.role = role
        self.is_active = is_active
        now = datetime.now(timezone.utc)
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> Dict[str, Any]:
        """Convert to MongoDB document dictionary."""
        return {
            "_id": self.id,
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "UserModel":
        """Reconstitute a UserModel from a MongoDB document."""
        return cls(
            id=str(data.get("id") or data.get("_id")),
            name=data["name"],
            email=data["email"],
            password_hash=data["password_hash"],
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
