from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.database import Base


class SimpleUser(Base):
    __tablename__ = "simple_users"
    
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
    subscription_tier = Column(String, default="free")
    subscription_status = Column(String, default="active")