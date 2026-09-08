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
        # Check if email is already taken
        existing_user = await self.user_service.get_by_email(req.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # Hash password and create user model
        pwd_hash = hash_password(req.password)
        new_user = UserModel(
            name=req.name.strip(),
            email=req.email.strip(),
            password_hash=pwd_hash,
            role="user",
            is_active=True,
        )

        # Insert into MongoDB
        await self.user_service.collection.insert_one(new_user.to_dict())

        # Generate tokens
        tokens = self._generate_tokens(new_user)
        user_response = UserService.to_response(new_user)

        return AuthResponseData(user=user_response, tokens=tokens)

    async def login(self, req: UserLoginRequest) -> AuthResponseData:
        """Authenticate user credentials and issue tokens."""
        user = await self.user_service.get_by_email(req.email)
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
