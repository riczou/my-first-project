from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=True)
    connection_name = Column(String, nullable=False)
    connection_profile_url = Column(String)
    connection_title = Column(String)
    connection_company = Column(String)
    connection_location = Column(String)
    relationship_strength = Column(Integer, default=1)  # 1-5 scale
    mutual_connections_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - temporarily disabled for basic auth testing
    # user = relationship("User", back_populates="connections")
    # platform = relationship("Platform", back_populates="connections")
    # job_matches = relationship("ConnectionJobMatch", back_populates="connection")


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    industry = Column(String)
    size = Column(String)
    location = Column(String)
    website = Column(String)
    linkedin_url = Column(String)
    
    # Relationships - temporarily disabled for basic auth testing
    # job_opportunities = relationship("JobOpportunity", back_populates="company")


class JobOpportunity(Base):
    __tablename__ = "job_opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    location = Column(String)
    salary_range = Column(String)
    experience_level = Column(String)
    posted_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    source_url = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships - temporarily disabled for basic auth testing
    # company = relationship("Company", back_populates="job_opportunities")
    # connection_matches = relationship("ConnectionJobMatch", back_populates="job_opportunity")


class ConnectionJobMatch(Base):
    __tablename__ = "connection_job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_id = Column(Integer, ForeignKey("connections.id"), nullable=False)
    job_opportunity_id = Column(Integer, ForeignKey("job_opportunities.id"), nullable=False)
    match_score = Column(Float, nullable=False)  # 0-100 scale
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships - temporarily disabled for basic auth testing
    # connection = relationship("Connection", back_populates="job_matches")
    # job_opportunity = relationship("JobOpportunity", back_populates="connection_matches")