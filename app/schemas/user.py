from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str


class UserCreate(UserBase):
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "password": "securepassword123"
            }
        }


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    is_verified: bool
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "password": "securepassword123"
            }
        }


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class PlatformBase(BaseModel):
    name: str
    base_url: str
    is_active: bool = True
    scraping_enabled: bool = False


class PlatformCreate(PlatformBase):
    pass


class PlatformResponse(PlatformBase):
    id: int
    
    class Config:
        from_attributes = True


class UserPlatformAccountBase(BaseModel):
    platform_username: str
    is_active: bool = True


class UserPlatformAccountCreate(UserPlatformAccountBase):
    platform_id: int
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


class UserPlatformAccountResponse(UserPlatformAccountBase):
    id: int
    user_id: int
    platform_id: int
    last_sync_at: Optional[datetime] = None
    platform: PlatformResponse
    
    class Config:
        from_attributes = True