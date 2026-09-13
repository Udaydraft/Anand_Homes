from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database, db_manager
from app.dependencies.auth import get_current_user
from app.models.user import UserModel
from app.schemas.user import ApiResponse, UserProfileUpdateRequest, UserRegisterRequest, UserResponse, UserUpdateRequest
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=ApiResponse[List[UserResponse]],
    summary="List all users",
    description="Retrieve all registered users, optionally filtered by role (e.g., 'supervisor' or 'admin').",
)
async def list_users(
    role: Optional[str] = Query(None, description="Filter by user role: 'admin' or 'supervisor'"),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[List[UserResponse]]:
    user_service = UserService(db)
    users = await user_service.list_users(role=role)
    return ApiResponse(
        success=True,
        message=f"Found {len(users)} users",
        data=users,
    )


@router.post(
    "",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user (Admin)",
    description="Directly provision an account for a new Site Supervisor or Administrator.",
)
async def create_user(
    payload: UserRegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[UserResponse]:
    auth_service = AuthService(db)
    result = await auth_service.register(payload)
    return ApiResponse(
        success=True,
        message="User account created successfully",
        data=result.user,
    )


@router.get(
    "/profile",
    response_model=ApiResponse[UserResponse],
    summary="Get authenticated user profile",
)
@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Get current user profile (alias)",
)
async def get_profile(
    current_user: UserModel = Depends(get_current_user),
) -> ApiResponse[UserResponse]:
    return ApiResponse(
        success=True,
        message="Profile retrieved",
        data=UserService.to_response(current_user),
    )


@router.put(
    "/profile",
    response_model=ApiResponse[UserResponse],
    summary="Update authenticated user profile",
)
@router.put(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Update current user profile (alias)",
)
@router.patch(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Patch current user profile",
)
async def update_profile(
    payload: UserProfileUpdateRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[UserResponse]:
    user_service = UserService(db)
    updated_user = await user_service.update_profile(current_user.id, payload)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for update.",
        )

    return ApiResponse(
        success=True,
        message="Profile updated successfully",
        data=UserService.to_response(updated_user),
    )


@router.get(
    "/{user_id}",
    response_model=ApiResponse[UserResponse],
    summary="Get user by ID",
)
async def get_user_by_id(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[UserResponse]:
    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return ApiResponse(
        success=True,
        message="User retrieved successfully",
        data=user_service.to_response(user),
    )


@router.put(
    "/{user_id}",
    response_model=ApiResponse[UserResponse],
    summary="Update user/supervisor",
)
async def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[UserResponse]:
    user_service = UserService(db)
    updated = await user_service.update_user(user_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for update.",
        )
    return ApiResponse(
        success=True,
        message="User updated successfully",
        data=user_service.to_response(updated),
    )


@router.delete(
    "/{user_id}",
    response_model=ApiResponse[dict],
    summary="Delete user/supervisor",
)
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ApiResponse[dict]:
    user_service = UserService(db)
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for deletion.",
        )
    return ApiResponse(
        success=True,
        message="User deleted successfully",
        data={"id": user_id},
    )

