from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.user import User, Platform, UserPlatformAccount
from ..schemas.user import (
    PlatformResponse, UserPlatformAccountCreate, UserPlatformAccountResponse
)
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PlatformResponse])
def read_platforms(db: Session = Depends(get_db)):
    platforms = db.query(Platform).filter(Platform.is_active == True).all()
    return platforms

@router.get("/{platform_id}", response_model=PlatformResponse)
def read_platform(platform_id: int, db: Session = Depends(get_db)):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform not found"
        )
    return platform

@router.post("/{platform_id}/connect", response_model=UserPlatformAccountResponse)
def connect_platform(
    platform_id: int,
    account_data: UserPlatformAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if platform exists
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform not found"
        )
    
    # Check if user already has account for this platform
    existing_account = db.query(UserPlatformAccount).filter(
        UserPlatformAccount.user_id == current_user.id,
        UserPlatformAccount.platform_id == platform_id
    ).first()
    
    if existing_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform account already connected"
        )
    
    # Create new platform account
    db_account = UserPlatformAccount(
        user_id=current_user.id,
        platform_id=platform_id,
        platform_username=account_data.platform_username,
        access_token=account_data.access_token,
        refresh_token=account_data.refresh_token,
        is_active=account_data.is_active
    )
    
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/{platform_id}/disconnect")
def disconnect_platform(
    platform_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find and remove the platform account
    account = db.query(UserPlatformAccount).filter(
        UserPlatformAccount.user_id == current_user.id,
        UserPlatformAccount.platform_id == platform_id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform account not found"
        )
    
    db.delete(account)
    db.commit()
    return {"message": "Platform disconnected successfully"}

@router.get("/{platform_id}/status")
def get_platform_status(
    platform_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(UserPlatformAccount).filter(
        UserPlatformAccount.user_id == current_user.id,
        UserPlatformAccount.platform_id == platform_id
    ).first()
    
    return {
        "connected": account is not None,
        "active": account.is_active if account else False,
        "last_sync": account.last_sync_at if account else None
    }

@router.post("/admin/seed")
def seed_platforms(db: Session = Depends(get_db)):
    """Admin endpoint to seed initial platform data"""
    
    # Check if platforms already exist
    existing_count = db.query(Platform).count()
    if existing_count > 0:
        return {
            "message": f"Platforms already exist ({existing_count} found)",
            "platforms_created": 0
        }
    
    # Create initial platforms
    platforms_data = [
        {
            "name": "LinkedIn",
            "base_url": "https://www.linkedin.com",
            "is_active": True,
            "scraping_enabled": True
        },
        {
            "name": "Facebook", 
            "base_url": "https://www.facebook.com",
            "is_active": True,
            "scraping_enabled": False
        },
        {
            "name": "Twitter",
            "base_url": "https://www.twitter.com", 
            "is_active": True,
            "scraping_enabled": False
        },
        {
            "name": "Instagram",
            "base_url": "https://www.instagram.com",
            "is_active": True,
            "scraping_enabled": False
        }
    ]
    
    created_platforms = []
    for platform_data in platforms_data:
        platform = Platform(**platform_data)
        db.add(platform)
        created_platforms.append(platform_data["name"])
    
    db.commit()
    
    return {
        "message": f"Successfully created {len(created_platforms)} platforms",
        "platforms_created": len(created_platforms),
        "platforms": created_platforms
    }