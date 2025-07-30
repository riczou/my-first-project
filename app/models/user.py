from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Subscription info
    subscription_tier = Column(String, default="free")  # free, professional, executive, enterprise
    subscription_status = Column(String, default="active")  # active, cancelled, expired
    last_recommendation_sent = Column(DateTime(timezone=True))
    referral_code = Column(String, unique=True, nullable=True)
    
    # Relationships - Re-enabled for full functionality
    platform_accounts = relationship("UserPlatformAccount", back_populates="user")
    connections = relationship("Connection", back_populates="user")


class Platform(Base):
    __tablename__ = "platforms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    base_url = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    scraping_enabled = Column(Boolean, default=False)
    
    # Relationships - Re-enabled for full functionality
    user_accounts = relationship("UserPlatformAccount", back_populates="platform")
    connections = relationship("Connection", back_populates="platform")


class UserPlatformAccount(Base):
    __tablename__ = "user_platform_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=False)
    platform_username = Column(String, nullable=False)
    access_token = Column(String)  # Will be encrypted
    refresh_token = Column(String)  # Will be encrypted
    last_sync_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Relationships - Re-enabled for full functionality
    user = relationship("User", back_populates="platform_accounts")
    platform = relationship("Platform", back_populates="user_accounts")