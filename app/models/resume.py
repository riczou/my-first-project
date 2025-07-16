from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String)  # Local storage path
    raw_text = Column(Text)  # Extracted text from PDF/DOC
    
    # Extracted information
    extracted_skills = Column(JSON)  # List of skills found
    extracted_experience = Column(JSON)  # Work experience data
    extracted_education = Column(JSON)  # Education data
    job_titles = Column(JSON)  # Previous job titles
    companies = Column(JSON)  # Previous companies
    
    # Metadata
    file_size = Column(Integer)  # File size in bytes
    file_type = Column(String)  # pdf, docx, etc.
    processed = Column(Boolean, default=False)
    processing_error = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - temporarily disabled for basic auth testing
    # user = relationship("User", back_populates="resumes")
    # job_matches = relationship("JobMatch", back_populates="resume")


class JobMatch(Base):
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Job details
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text)
    job_location = Column(String)
    job_type = Column(String)  # full-time, part-time, contract, etc.
    job_url = Column(String)
    
    # Matching details
    match_score = Column(Integer)  # 0-100 score
    matching_skills = Column(JSON)  # Skills that matched
    network_connections = Column(JSON)  # Connections at this company
    connection_strength = Column(Integer)  # How strong network connection is
    
    # Status tracking
    status = Column(String, default="new")  # new, interested, applied, rejected, etc.
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - temporarily disabled for basic auth testing
    # resume = relationship("Resume", back_populates="job_matches")


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String)  # technical, soft, industry, etc.
    aliases = Column(JSON)  # Alternative names for the skill
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())