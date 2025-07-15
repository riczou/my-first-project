from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_email = Column(String(255), nullable=False)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(50), nullable=False, unique=True)
    status = Column(String(20), default="pending")  # pending, signed_up, subscribed
    reward_type = Column(String(20), nullable=True)  # free_month, discount, cash, upgrade
    reward_amount = Column(Float, default=0.0)
    reward_processed = Column(Boolean, default=False)
    date_invited = Column(DateTime, default=datetime.utcnow)
    date_signed_up = Column(DateTime, nullable=True)
    date_subscribed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals_made")
    referred_user = relationship("User", foreign_keys=[referred_user_id], back_populates="referrals_received")

class ReferralReward(Base):
    __tablename__ = "referral_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referral_id = Column(Integer, ForeignKey("referrals.id"), nullable=False)
    reward_type = Column(String(20), nullable=False)  # free_month, discount, cash, upgrade
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, processed, expired
    expires_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    referral = relationship("Referral")

class ReferralStats(Base):
    __tablename__ = "referral_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_referrals = Column(Integer, default=0)
    successful_referrals = Column(Integer, default=0)
    total_earned = Column(Float, default=0.0)
    pending_rewards = Column(Float, default=0.0)
    current_streak = Column(Integer, default=0)
    rank = Column(String(20), default="Starter")  # Starter, Ambassador, Champion, Legend
    rank_points = Column(Integer, default=0)
    last_referral_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="referral_stats")