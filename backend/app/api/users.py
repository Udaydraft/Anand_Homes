from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.models.user import UserModel
from app.schemas.user import ApiResponse, UserProfileUpdateRequest, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/profile",
    response_model=ApiResponse[UserResponse],
    summary="Get authenticated user profile",
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
