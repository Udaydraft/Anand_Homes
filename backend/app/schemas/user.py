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
    role: Optional[str] = Field("supervisor", description="Role: admin or supervisor")


class UserLoginRequest(BaseModel):
    email: str = Field(..., examples=["admin@anandhomes.com", "supervisor1"])
    password: str = Field(..., min_length=1)


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10, description="Valid JWT refresh token")


class UserResponse(UserBase):
    id: str
    role: str = "user"
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    login_id: Optional[str] = None
    assigned_site: Optional[str] = None
    assigned_project: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponseData(BaseModel):
    user: UserResponse
    tokens: TokenResponse


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Login ID or Email Address", examples=["karthik.raja", "karthik.raja@anandhomes.com"])
    new_password: str = Field(..., min_length=6, description="New Password (minimum 6 characters)")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    is_active: Optional[bool] = None

