import datetime
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import UserModel
from app.schemas.user import (
    AuthResponseData,
    TokenRefreshRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.services.user_service import UserService

settings = get_settings()


class AuthService:
    """Orchestrates registration, credential verification, and token issuance."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.user_service = UserService(db)

    def _generate_tokens(self, user: UserModel) -> TokenResponse:
        """Create paired access and refresh tokens for an authenticated user."""
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id)
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        )

    async def register(self, req: UserRegisterRequest) -> AuthResponseData:
        """Register a new user account with hashed password."""
        email_clean = req.email.strip().lower()
        existing_user = await self.user_service.get_by_email(email_clean)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # Hash password and create user model
        pwd_hash = hash_password(req.password)
        # Determine role strictly: admin or supervisor
        assigned_role = "admin" if (getattr(req, "role", "supervisor") == "admin" or "admin@" in email_clean) else "supervisor"

        new_user = UserModel(
            name=req.name.strip(),
            email=email_clean,
            password_hash=pwd_hash,
            role=assigned_role,
            is_active=True,
        )

        # Insert into MongoDB
        await self.user_service.collection.insert_one(new_user.to_dict())
        try:
            from app.database.mongodb import db_manager
            db_manager.mark_dirty()
            await db_manager.save_to_disk()
        except Exception:
            pass

        # Generate tokens
        tokens = self._generate_tokens(new_user)
        user_response = UserService.to_response(new_user)

        return AuthResponseData(user=user_response, tokens=tokens)

    async def login(self, req: UserLoginRequest) -> AuthResponseData:
        """Authenticate user credentials and issue tokens."""
        email_clean = req.email.strip().lower()
        user = await self.user_service.get_by_email(email_clean)

        # Convenience auto-provision for default admin/supervisor accounts on clean DB
        if not user and req.password == "Password@123":
            if email_clean == "admin@anandhomes.com":
                user = UserModel(
                    name="Admin User",
                    email="admin@anandhomes.com",
                    password_hash=hash_password("Password@123"),
                    role="admin",
                    is_active=True,
                )
                await self.user_service.collection.insert_one(user.to_dict())
                try:
                    from app.database.mongodb import db_manager
                    db_manager.mark_dirty()
                    await db_manager.save_to_disk()
                except Exception:
                    pass
            elif email_clean == "rajesh.k@anandhomes.com":
                user = UserModel(
                    name="Rajesh Kumar",
                    email="rajesh.k@anandhomes.com",
                    password_hash=hash_password("Password@123"),
                    role="supervisor",
                    is_active=True,
                )
                await self.user_service.collection.insert_one(user.to_dict())
                try:
                    from app.database.mongodb import db_manager
                    db_manager.mark_dirty()
                    await db_manager.save_to_disk()
                except Exception:
                    pass

        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )

        # Strictly enforce admin vs supervisor role
        correct_role = "admin" if (user.role == "admin" or "admin@" in user.email) else "supervisor"
        if user.role != correct_role:
            user.role = correct_role
            await self.user_service.collection.update_one(
                {"$or": [{"_id": user.id}, {"id": user.id}, {"email": user.email}]},
                {"$set": {"role": correct_role}},
            )

        tokens = self._generate_tokens(user)
        user_response = UserService.to_response(user)

        return AuthResponseData(user=user_response, tokens=tokens)

    async def refresh_tokens(self, req: TokenRefreshRequest) -> TokenResponse:
        """Verify refresh token and issue a fresh token pair."""
        payload = decode_token(req.refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token subject invalid.",
            )

        user = await self.user_service.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive.",
            )

        return self._generate_tokens(user)
