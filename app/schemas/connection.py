from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConnectionBase(BaseModel):
    connection_name: str
    connection_profile_url: Optional[str] = None
    connection_title: Optional[str] = None
    connection_company: Optional[str] = None
    connection_location: Optional[str] = None
    relationship_strength: int = 1
    mutual_connections_count: int = 0


class ConnectionCreate(ConnectionBase):
    platform_id: Optional[int] = None


class ConnectionUpdate(BaseModel):
    connection_name: Optional[str] = None
    connection_profile_url: Optional[str] = None
    connection_title: Optional[str] = None
    connection_company: Optional[str] = None
    connection_location: Optional[str] = None
    relationship_strength: Optional[int] = None
    mutual_connections_count: Optional[int] = None


class ConnectionResponse(ConnectionBase):
    id: int
    user_id: int
    platform_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int
    
    class Config:
        from_attributes = True


class JobOpportunityBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    experience_level: Optional[str] = None
    source_url: Optional[str] = None
    is_active: bool = True


class JobOpportunityCreate(JobOpportunityBase):
    company_id: int
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class JobOpportunityResponse(JobOpportunityBase):
    id: int
    company_id: int
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    company: CompanyResponse
    
    class Config:
        from_attributes = True


class ConnectionJobMatchBase(BaseModel):
    match_score: float


class ConnectionJobMatchCreate(ConnectionJobMatchBase):
    connection_id: int
    job_opportunity_id: int


class ConnectionJobMatchResponse(ConnectionJobMatchBase):
    id: int
    user_id: int
    connection_id: int
    job_opportunity_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True