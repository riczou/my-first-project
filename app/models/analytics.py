from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class NetworkAnalytics(Base):
    __tablename__ = "network_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    health_score = Column(Integer, default=0)  # 0-100
    diversity_score = Column(Integer, default=0)  # 0-100
    strength_score = Column(Integer, default=0)  # 0-100
    network_size = Column(Integer, default=0)
    industries_count = Column(Integer, default=0)
    companies_count = Column(Integer, default=0)
    senior_connections = Column(Integer, default=0)
    growth_rate = Column(Float, default=0.0)  # percentage
    recommendations_count = Column(Integer, default=0)
    last_calculated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="network_analytics")

class ConnectionInsight(Base):
    __tablename__ = "connection_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_id = Column(Integer, ForeignKey("connections.id"), nullable=False)
    insight_type = Column(String(50), nullable=False)  # mutual_connections, career_path, company_move
    insight_data = Column(JSON, nullable=True)  # Store structured insight data
    confidence_score = Column(Float, default=0.0)  # 0-1
    is_actionable = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")  # low, medium, high
    status = Column(String(20), default="active")  # active, dismissed, acted_upon
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    connection = relationship("Connection")

class NetworkRecommendation(Base):
    __tablename__ = "network_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # connection, outreach, industry_expansion
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    action_items = Column(JSON, nullable=True)  # List of suggested actions
    priority = Column(String(20), default="medium")  # low, medium, high
    potential_impact = Column(String(20), default="medium")  # low, medium, high
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    estimated_time = Column(String(50), nullable=True)  # e.g., "15 minutes", "1 hour"
    status = Column(String(20), default="pending")  # pending, in_progress, completed, dismissed
    completion_rate = Column(Float, default=0.0)  # 0-100
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class DiscoveryProfile(Base):
    __tablename__ = "discovery_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # github, linkedin, twitter, scholar
    username = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    last_active = Column(DateTime, nullable=True)
    mutual_connections = Column(Integer, default=0)
    connection_strength = Column(Float, default=0.0)  # 0-100
    potential_value = Column(Float, default=0.0)  # 0-100
    profile_data = Column(JSON, nullable=True)  # Store additional platform-specific data
    last_synced = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type = Column(String(50), nullable=False)  # login, connection_add, analysis_run, etc.
    event_data = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")