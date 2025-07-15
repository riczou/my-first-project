from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
import os
import uuid
import re
from datetime import datetime
import PyPDF2
import io
from docx import Document

from ..core.database import get_db
from ..models.user import User
from ..models.connection import Connection
from ..models.resume import Resume, JobMatch, Skill
from .auth import get_current_user

router = APIRouter()

# Skills database for matching
TECH_SKILLS = [
    "python", "javascript", "java", "react", "node.js", "sql", "aws", "docker", "kubernetes", "git",
    "html", "css", "typescript", "angular", "vue", "mongodb", "postgresql", "redis", "elasticsearch",
    "machine learning", "data science", "ai", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
    "fastapi", "django", "flask", "express", "spring", "laravel", "ruby on rails", "php", "c++", "c#",
    "go", "rust", "swift", "kotlin", "flutter", "react native", "ios", "android", "unity", "unreal",
    "azure", "gcp", "terraform", "jenkins", "ci/cd", "devops", "microservices", "apis", "graphql", "rest"
]

BUSINESS_SKILLS = [
    "project management", "agile", "scrum", "kanban", "leadership", "team management", "communication",
    "problem solving", "analytical thinking", "strategic planning", "budget management", "stakeholder management",
    "product management", "marketing", "sales", "business development", "consulting", "negotiation",
    "customer service", "account management", "relationship building", "presentation skills", "public speaking",
    "writing", "research", "data analysis", "financial analysis", "risk management", "compliance",
    "operations", "supply chain", "logistics", "quality assurance", "process improvement", "change management"
]

SOFT_SKILLS = [
    "leadership", "teamwork", "communication", "problem solving", "creativity", "adaptability", "time management",
    "critical thinking", "attention to detail", "multitasking", "collaboration", "interpersonal skills",
    "customer focus", "results driven", "self motivated", "innovative", "reliable", "organized", "flexible",
    "positive attitude", "work ethic", "emotional intelligence", "conflict resolution", "decision making"
]

ALL_SKILLS = TECH_SKILLS + BUSINESS_SKILLS + SOFT_SKILLS

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from resume text using keyword matching"""
    text_lower = text.lower()
    found_skills = []
    
    for skill in ALL_SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    # Remove duplicates and return
    return list(set(found_skills))

def extract_experience_from_text(text: str) -> List[dict]:
    """Extract work experience from resume text"""
    experience = []
    
    # Simple pattern matching for job titles and companies
    # This is a basic implementation - in production you'd use more sophisticated NLP
    lines = text.split('\n')
    
    current_job = {}
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for job titles (often followed by company names)
        if any(keyword in line.lower() for keyword in ['engineer', 'manager', 'director', 'analyst', 'developer', 'designer', 'consultant']):
            if current_job:
                experience.append(current_job)
            current_job = {'title': line}
        
        # Look for company names (often have 'at', 'inc', 'llc', 'corp')
        elif any(keyword in line.lower() for keyword in [' at ', ' inc', ' llc', ' corp', ' ltd', ' company']):
            if current_job:
                current_job['company'] = line
    
    if current_job:
        experience.append(current_job)
    
    return experience

def calculate_job_match_score(resume_skills: List[str], job_description: str, network_connections: List[dict]) -> dict:
    """Calculate how well a job matches the user's resume and network"""
    job_desc_lower = job_description.lower()
    
    # Skill matching (60% of score)
    matching_skills = []
    for skill in resume_skills:
        if skill.lower() in job_desc_lower:
            matching_skills.append(skill)
    
    skill_score = min(len(matching_skills) * 10, 60)  # Max 60 points for skills
    
    # Network connection bonus (40% of score)
    network_score = 0
    if network_connections:
        # Higher score for more connections and stronger relationships
        total_strength = sum(conn.get('relationship_strength', 0) for conn in network_connections)
        network_score = min(total_strength * 8, 40)  # Max 40 points for network
    
    total_score = skill_score + network_score
    
    return {
        'total_score': min(total_score, 100),
        'skill_score': skill_score,
        'network_score': network_score,
        'matching_skills': matching_skills
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process resume file"""
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF or DOCX file"
        )
    
    # Validate file size (5MB limit)
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    try:
        # Extract text from file
        if file.content_type == 'application/pdf':
            raw_text = extract_text_from_pdf(file_content)
            file_type = 'pdf'
        else:
            raw_text = extract_text_from_docx(file_content)
            file_type = 'docx'
        
        if not raw_text or len(raw_text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract sufficient text from file. Please ensure the file is not password protected."
            )
        
        # Extract skills and experience
        extracted_skills = extract_skills_from_text(raw_text)
        extracted_experience = extract_experience_from_text(raw_text)
        
        # Extract job titles and companies
        job_titles = [exp.get('title', '') for exp in extracted_experience if exp.get('title')]
        companies = [exp.get('company', '') for exp in extracted_experience if exp.get('company')]
        
        # Create resume record
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            raw_text=raw_text,
            extracted_skills=extracted_skills,
            extracted_experience=extracted_experience,
            job_titles=job_titles,
            companies=companies,
            file_size=len(file_content),
            file_type=file_type,
            processed=True
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return {
            "message": "Resume uploaded and processed successfully",
            "resume_id": resume.id,
            "extracted_skills_count": len(extracted_skills),
            "extracted_skills": extracted_skills[:10],  # Show first 10 skills
            "experience_count": len(extracted_experience),
            "file_type": file_type,
            "file_size": len(file_content)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )

@router.get("/")
def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for the current user"""
    
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    return [
        {
            "id": resume.id,
            "filename": resume.filename,
            "file_type": resume.file_type,
            "file_size": resume.file_size,
            "skills_count": len(resume.extracted_skills or []),
            "processed": resume.processed,
            "created_at": resume.created_at,
            "updated_at": resume.updated_at
        }
        for resume in resumes
    ]

@router.get("/{resume_id}")
def get_resume_details(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific resume"""
    
    resume = db.query(Resume).filter(
        and_(Resume.id == resume_id, Resume.user_id == current_user.id)
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return {
        "id": resume.id,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "file_size": resume.file_size,
        "extracted_skills": resume.extracted_skills,
        "extracted_experience": resume.extracted_experience,
        "job_titles": resume.job_titles,
        "companies": resume.companies,
        "processed": resume.processed,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }

@router.get("/{resume_id}/job-matches")
def get_job_matches(
    resume_id: int,
    industry: Optional[str] = Query(None, description="Filter by industry"),
    min_score: int = Query(50, description="Minimum match score"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job recommendations based on resume and network connections"""
    
    resume = db.query(Resume).filter(
        and_(Resume.id == resume_id, Resume.user_id == current_user.id)
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if not resume.extracted_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has not been processed or no skills were extracted"
        )
    
    # Get user's connections grouped by company
    connections_query = db.query(
        Connection.connection_company,
        func.count(Connection.id).label('connection_count'),
        func.avg(Connection.relationship_strength).label('avg_strength'),
        func.group_concat(Connection.connection_name).label('connection_names')
    ).filter(
        and_(
            Connection.user_id == current_user.id,
            Connection.connection_company.isnot(None),
            Connection.connection_company != ""
        )
    ).group_by(Connection.connection_company).all()
    
    # Generate job matches for companies in user's network
    job_matches = []
    
    # Real company career page URLs and job data
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

    # Mock job data with realistic job descriptions
    mock_jobs_by_company = {
        "Google": [
            {"title": "Senior Software Engineer", "description": "Python, JavaScript, machine learning, data science, cloud computing, microservices, distributed systems", "location": "Mountain View, CA", "type": "Full-time"},
            {"title": "Product Manager", "description": "Product management, agile, stakeholder management, data analysis, user research, strategic thinking", "location": "San Francisco, CA", "type": "Full-time"},
            {"title": "Data Scientist", "description": "Python, machine learning, tensorflow, pandas, sql, statistics, data visualization, A/B testing", "location": "New York, NY", "type": "Full-time"}
        ],
        "Microsoft": [
            {"title": "Cloud Solution Architect", "description": "Azure, cloud computing, devops, kubernetes, docker, microservices, leadership, customer success", "location": "Seattle, WA", "type": "Full-time"},
            {"title": "Software Development Engineer", "description": "C#, .NET, Azure, sql server, agile, teamwork, problem solving, scalable systems", "location": "Redmond, WA", "type": "Full-time"}
        ],
        "Apple": [
            {"title": "iOS Developer", "description": "Swift, iOS development, mobile apps, user experience, agile, teamwork, performance optimization", "location": "Cupertino, CA", "type": "Full-time"},
            {"title": "Product Designer", "description": "UI/UX design, user research, prototyping, creativity, collaboration, design systems", "location": "Cupertino, CA", "type": "Full-time"}
        ],
        "Goldman Sachs": [
            {"title": "Investment Banking Analyst", "description": "Financial analysis, modeling, client management, teamwork, analytical thinking, presentation skills", "location": "New York, NY", "type": "Full-time"},
            {"title": "Technology Analyst", "description": "Python, Java, financial systems, data analysis, problem solving, agile development", "location": "New York, NY", "type": "Full-time"}
        ],
        "Revolut": [
            {"title": "Backend Developer", "description": "Python, Java, microservices, AWS, database design, API development, fintech experience", "location": "London, UK", "type": "Full-time"},
            {"title": "Product Manager", "description": "Product management, fintech, user research, data analysis, agile, stakeholder management", "location": "New York, NY", "type": "Full-time"}
        ]
    }
    
    for company_data in connections_query:
        company_name = company_data.connection_company
        
        # Get connection details for this company
        network_connections = []
        if company_data.connection_names:
            connection_names = company_data.connection_names.split(',')
            for name in connection_names:
                network_connections.append({
                    'name': name.strip(),
                    'relationship_strength': company_data.avg_strength or 3
                })
        
        # Get jobs for this company (using mock data)
        company_jobs = mock_jobs_by_company.get(company_name, [
            {"title": f"Open Position at {company_name}", "description": "Great opportunity to join our team with your skills and experience", "location": "Various", "type": "Full-time"}
        ])
        
        # Get the real career page URL for this company
        career_url = COMPANY_CAREER_URLS.get(company_name, f"https://www.google.com/search?q={company_name.replace(' ', '+')}+careers")
        
        for job in company_jobs:
            # Calculate match score
            match_data = calculate_job_match_score(
                resume.extracted_skills,
                job['description'],
                network_connections
            )
            
            if match_data['total_score'] >= min_score:
                job_matches.append({
                    "company_name": company_name,
                    "job_title": job['title'],
                    "job_description": job['description'],
                    "job_location": job['location'],
                    "job_type": job['type'],
                    "job_url": career_url,
                    "match_score": match_data['total_score'],
                    "skill_score": match_data['skill_score'],
                    "network_score": match_data['network_score'],
                    "matching_skills": match_data['matching_skills'],
                    "network_connections": network_connections,
                    "connection_count": len(network_connections)
                })
    
    # Sort by match score descending
    job_matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return {
        "resume_id": resume_id,
        "job_matches": job_matches,
        "total_matches": len(job_matches),
        "resume_skills": resume.extracted_skills,
        "filters_applied": {
            "industry": industry,
            "min_score": min_score
        }
    }

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    
    resume = db.query(Resume).filter(
        and_(Resume.id == resume_id, Resume.user_id == current_user.id)
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}