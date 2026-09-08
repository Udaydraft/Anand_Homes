import logging
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.models.user import UserModel
from app.schemas.user import (
    ApiResponse,
    AuthResponseData,
    TokenRefreshRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

logger = logging.getLogger("app.api.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ApiResponse[AuthResponseData],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account with hashed password and generates initial access & refresh tokens.",
)
async def register(
    payload: UserRegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[AuthResponseData]:
    auth_service = AuthService(db)
    result = await auth_service.register(payload)
    logger.info("User registered successfully: id=%s, email=%s", result.user.id, result.user.email)
    return ApiResponse(
        success=True,
        message="User registered successfully",
        data=result,
    )


@router.post(
    "/login",
    response_model=ApiResponse[AuthResponseData],
    status_code=status.HTTP_200_OK,
    summary="Login with credentials",
    description="Validates email and password, returning user profile and access/refresh token pair.",
)
async def login(
    payload: UserLoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[AuthResponseData]:
    auth_service = AuthService(db)
    result = await auth_service.login(payload)
    logger.info("User logged in successfully: id=%s", result.user.id)
    return ApiResponse(
        success=True,
        message="Login successful",
        data=result,
    )


@router.post(
    "/refresh",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Exchanges a valid refresh token for a new access token and refresh token.",
)
async def refresh(
    payload: TokenRefreshRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[TokenResponse]:
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_tokens(payload)
    return ApiResponse(
        success=True,
        message="Tokens refreshed successfully",
        data=tokens,
    )


@router.post(
    "/logout",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Invalidates current client session state.",
)
async def logout(
    current_user: UserModel = Depends(get_current_user),
) -> ApiResponse[dict]:
    logger.info("User logged out: id=%s", current_user.id)
    return ApiResponse(
        success=True,
        message="Logged out successfully",
        data={"user_id": current_user.id},
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieves the authenticated user's profile details using Bearer token.",
)
async def get_me(
    current_user: UserModel = Depends(get_current_user),
) -> ApiResponse[UserResponse]:
    return ApiResponse(
        success=True,
        message="User profile retrieved",
        data=UserService.to_response(current_user),
    )
