from datetime import datetime
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, EmailStr, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standardized API response envelope."""
    success: bool = True
    message: str = "Request successful"
    data: Optional[T] = None


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane.doe@example.com"])


class UserRegisterRequest(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters")


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["jane.doe@example.com"])
    password: str = Field(..., min_length=1)


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10, description="Valid JWT refresh token")


class UserResponse(UserBase):
    id: str
    role: str = "user"
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponseData(BaseModel):
    user: UserResponse
    tokens: TokenResponse


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
