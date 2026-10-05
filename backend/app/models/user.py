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
        role: str = "supervisor",
        is_active: bool = True,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        login_id: Optional[str] = None,
        assigned_site: Optional[str] = None,
        assigned_project: Optional[str] = None,
    ) -> None:
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.email = email.lower().strip()
        self.password_hash = password_hash
        # Strictly admin or supervisor
        self.role = "admin" if (role == "admin" or "admin@" in self.email) else "supervisor"
        self.is_active = is_active
        now = datetime.now(timezone.utc)
        self.created_at = created_at or now
        self.updated_at = updated_at or now
        self.login_id = (login_id or self.email.split("@")[0]).lower().strip()
        self.assigned_site = assigned_site
        self.assigned_project = assigned_project

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
            "login_id": self.login_id,
            "assigned_site": self.assigned_site,
            "assigned_project": self.assigned_project,
        }

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> "UserModel":
        """Reconstitute a UserModel from a MongoDB document."""
        email = data.get("email", "").lower().strip()
        raw_role = data.get("role")
        assigned_role = "admin" if (raw_role == "admin" or "admin@" in email) else "supervisor"
        return cls(
            id=str(data.get("id") or data.get("_id")),
            name=data["name"],
            email=email,
            password_hash=data["password_hash"],
            role=assigned_role,
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            login_id=data.get("login_id") or data.get("loginId"),
            assigned_site=data.get("assigned_site") or data.get("assignedSite") or data.get("site"),
            assigned_project=data.get("assigned_project") or data.get("assignedProject") or data.get("project"),
        )

