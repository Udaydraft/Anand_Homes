from fastapi import APIRouter
from app.database.mongodb import db_manager
from app.schemas.user import ApiResponse

router = APIRouter(prefix="/database", tags=["Database Operations"])


@router.get(
    "/status",
    summary="Get Database Connectivity and Cloud Sync Status",
    description="Returns detailed status regarding MongoDB Atlas connection, persistent local backup, and client IP.",
)
async def get_database_status() -> ApiResponse[dict]:
    status_info = await db_manager.get_status()
    return ApiResponse(
        success=True,
        message="Database status retrieved successfully",
        data=status_info,
    )


@router.post(
    "/retry-atlas",
    summary="Retry MongoDB Atlas Cloud Connection",
    description="Manually triggers a reconnection attempt to MongoDB Atlas after user whitelists IP in Network Access.",
)
async def retry_atlas_connection() -> ApiResponse[dict]:
    await db_manager.connect()
    status_info = await db_manager.get_status()
    message = (
        "Connected to MongoDB Atlas Cloud successfully!"
        if status_info["is_atlas"]
        else f"Atlas connection failed: {status_info.get('atlas_error')}. Please verify IP whitelist."
    )
    return ApiResponse(
        success=status_info["is_atlas"],
        message=message,
        data=status_info,
    )
