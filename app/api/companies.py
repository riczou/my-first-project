from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import List, Optional
import requests
from ..core.database import get_db
from ..models.user import User
from ..models.connection import Connection, Company, JobOpportunity
from .auth import get_current_user

router = APIRouter()

# Mock industry data - in production you'd use a proper API
INDUSTRY_MAP = {
    "technology": ["google", "microsoft", "apple", "meta", "amazon", "netflix", "tesla", "spotify", "airbnb", "uber", "linkedin", "salesforce", "adobe", "intel", "oracle", "slack", "zoom", "dropbox", "square", "twilio", "procore", "revolut", "blueflame", "nasdaq"],
    "finance": ["goldman sachs", "jpmorgan", "morgan stanley", "blackrock", "vanguard", "fidelity", "charles schwab", "robinhood", "stripe", "fintech", "capital", "investments", "bank", "credit", "allstate", "ivg", "ipd capital"],
    "consulting": ["mckinsey", "deloitte", "accenture", "boston consulting", "bain", "pwc", "ey", "kpmg", "metis search", "barrett group"],
    "healthcare": ["johnson & johnson", "pfizer", "roche", "novartis", "merck", "abbvie", "bristol myers", "gilead", "amgen", "biogen"],
    "retail": ["walmart", "amazon", "target", "costco", "home depot", "nike", "adidas", "michael kors", "zara", "h&m"],
    "energy": ["exxon", "chevron", "shell", "bp", "conocophillips", "total", "equinor", "schlumberger", "halliburton"],
    "manufacturing": ["general electric", "boeing", "ford", "general motors", "tesla", "3m", "caterpillar", "honeywell", "lockheed martin"],
    "media": ["disney", "comcast", "netflix", "warner", "viacom", "fox", "cbs", "nbc", "espn"],
    "telecommunications": ["verizon", "at&t", "t-mobile", "sprint", "comcast", "charter", "vodafone"],
    "transportation": ["fedex", "ups", "dhl", "uber", "lyft", "dp world", "logistics"],
    "real_estate": ["cbre", "jones lang lasalle", "cushman", "colliers", "real estate", "realty"],
    "recruiting": ["robert half", "randstad", "adecco", "manpower", "korn ferry", "heidrick", "russell reynolds"]
}

def classify_industry(company_name: str) -> str:
    """Classify company into industry based on name"""
    if not company_name:
        return "other"
    
    company_lower = company_name.lower()
    
    for industry, keywords in INDUSTRY_MAP.items():
        if any(keyword in company_lower for keyword in keywords):
            return industry
    
    return "other"

@router.get("/analytics")
def get_company_analytics(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    min_connections: int = Query(1, description="Minimum number of connections per company"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics about companies in user's network"""
    
    # Get company data from connections
    query = db.query(
        Connection.connection_company,
        func.count(Connection.id).label('connection_count'),
        func.group_concat(Connection.connection_name).label('connection_names'),
        func.group_concat(Connection.connection_title).label('connection_titles'),
        func.avg(Connection.relationship_strength).label('avg_relationship_strength')
    ).filter(
        Connection.user_id == current_user.id,
        Connection.connection_company.isnot(None),
        Connection.connection_company != ""
    ).group_by(Connection.connection_company)
    
    # Apply minimum connections filter
    query = query.having(func.count(Connection.id) >= min_connections)
    
    companies_data = query.all()
    
    # Process and classify companies
    companies = []
    for company_data in companies_data:
        company_name = company_data.connection_company
        company_industry = classify_industry(company_name)
        
        # Apply industry filter if specified
        if industry and company_industry != industry:
            continue
            
        # Get sample connection names and titles
        connection_names = company_data.connection_names.split(',')[:5] if company_data.connection_names else []
        connection_titles = company_data.connection_titles.split(',')[:5] if company_data.connection_titles else []
        
        companies.append({
            "name": company_name,
            "industry": company_industry,
            "connection_count": company_data.connection_count,
            "avg_relationship_strength": round(float(company_data.avg_relationship_strength or 0), 1),
            "sample_connections": connection_names,
            "sample_titles": connection_titles,
            "has_jobs": False  # Will be populated with real job data later
        })
    
    # Sort by connection count descending
    companies.sort(key=lambda x: x['connection_count'], reverse=True)
    
    # Get industry summary
    industry_summary = {}
    for company in companies:
        industry = company['industry']
        if industry not in industry_summary:
            industry_summary[industry] = {
                "company_count": 0,
                "total_connections": 0
            }
        industry_summary[industry]["company_count"] += 1
        industry_summary[industry]["total_connections"] += company['connection_count']
    
    return {
        "companies": companies,
        "industry_summary": industry_summary,
        "total_companies": len(companies),
        "total_connections": sum(c['connection_count'] for c in companies)
    }

@router.get("/industries")
def get_industries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of industries represented in user's network"""
    
    # Get all companies from user's connections
    companies = db.query(distinct(Connection.connection_company)).filter(
        Connection.user_id == current_user.id,
        Connection.connection_company.isnot(None),
        Connection.connection_company != ""
    ).all()
    
    # Classify into industries
    industry_counts = {}
    for (company_name,) in companies:
        industry = classify_industry(company_name)
        industry_counts[industry] = industry_counts.get(industry, 0) + 1
    
    # Format for frontend
    industries = [
        {
            "name": industry,
            "display_name": industry.replace('_', ' ').title(),
            "company_count": count
        }
        for industry, count in sorted(industry_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return industries

@router.get("/{company_name}/jobs")
def get_company_jobs(
    company_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job opportunities for a specific company (mock data for MVP)"""
    
    # Real company career page URLs
    COMPANY_CAREER_URLS = {
        "Google": "https://careers.google.com/jobs/results/",
        "Microsoft": "https://careers.microsoft.com/professionals/us/en/search-results",
        "Apple": "https://jobs.apple.com/en-us/search",
        "Meta": "https://www.metacareers.com/jobs/",
        "Amazon": "https://www.amazon.jobs/en/search",
        "Netflix": "https://jobs.netflix.com/search",
        "Tesla": "https://www.tesla.com/careers/search/",
        "Salesforce": "https://careers.salesforce.com/en/jobs/",
        "Adobe": "https://careers.adobe.com/us/en/search-results",
        "LinkedIn": "https://careers.linkedin.com/jobs",
        "Uber": "https://www.uber.com/us/en/careers/list/",
        "Airbnb": "https://careers.airbnb.com/",
        "Spotify": "https://www.lifeatspotify.com/jobs",
        "Goldman Sachs": "https://www.goldmansachs.com/careers/",
        "JPMorgan": "https://careers.jpmorgan.com/global/en/students/programs",
        "Morgan Stanley": "https://www.morganstanley.com/careers",
        "McKinsey": "https://www.mckinsey.com/careers",
        "Deloitte": "https://jobs.deloitte.com/",
        "Accenture": "https://www.accenture.com/us-en/careers/jobsearch",
        "Robert Half": "https://www.roberthalf.com/work-with-us/our-company/careers",
        "Revolut": "https://www.revolut.com/careers/",
        "Procore": "https://careers.procore.com/",
        "Nasdaq": "https://www.nasdaq.com/about/careers"
    }
    
    # Get the real career page URL for this company
    career_url = COMPANY_CAREER_URLS.get(company_name, f"https://www.google.com/search?q={company_name.replace(' ', '+')}+careers")
    
    # For now, return mock job data with real URLs
    mock_jobs = [
        {
            "id": f"{company_name.lower().replace(' ', '-')}-1",
            "title": "Senior Software Engineer",
            "department": "Engineering",
            "location": "San Francisco, CA",
            "type": "Full-time",
            "posted_date": "2025-07-10",
            "description": "We're looking for a senior software engineer to join our growing team...",
            "url": career_url
        },
        {
            "id": f"{company_name.lower().replace(' ', '-')}-2", 
            "title": "Product Manager",
            "department": "Product",
            "location": "New York, NY",
            "type": "Full-time",
            "posted_date": "2025-07-08",
            "description": "Join our product team to help shape the future of our platform...",
            "url": career_url
        },
        {
            "id": f"{company_name.lower().replace(' ', '-')}-3",
            "title": "Business Development Representative", 
            "department": "Sales",
            "location": "Remote",
            "type": "Full-time",
            "posted_date": "2025-07-05",
            "description": "Help us expand our customer base as a Business Development Representative...",
            "url": career_url
        }
    ]
    
    return {
        "company": company_name,
        "jobs": mock_jobs,
        "total_jobs": len(mock_jobs)
    }

@router.get("/{company_name}/connections")
def get_company_connections(
    company_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connections at a specific company"""
    
    connections = db.query(Connection).filter(
        Connection.user_id == current_user.id,
        Connection.connection_company.ilike(f"%{company_name}%")
    ).all()
    
    return {
        "company": company_name,
        "connections": [
            {
                "id": conn.id,
                "name": conn.connection_name,
                "title": conn.connection_title,
                "location": conn.connection_location,
                "relationship_strength": conn.relationship_strength,
                "profile_url": conn.connection_profile_url,
                "created_at": conn.created_at
            }
            for conn in connections
        ],
        "total_connections": len(connections)
    }