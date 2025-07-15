from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String(50), nullable=False)  # free, professional, executive, enterprise
    billing_cycle = Column(String(20), nullable=False)  # monthly, yearly
    price = Column(Float, nullable=False)
    status = Column(String(20), default="active")  # active, cancelled, expired
    starts_at = Column(DateTime, default=datetime.utcnow)
    ends_at = Column(DateTime, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    payment_id = Column(String(100), nullable=True)  # Stripe payment intent ID
    renewal_reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")

class PaymentHistory(Base):
    __tablename__ = "payment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    payment_method = Column(String(50), nullable=False)  # card, paypal, etc.
    stripe_payment_id = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False)  # succeeded, failed, pending
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    subscription = relationship("Subscription")