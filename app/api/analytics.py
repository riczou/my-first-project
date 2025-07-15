from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.database import get_db
from ..core.security import get_current_user
from ..models import User, NetworkAnalytics, Connection, Company
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/network-health")
async def get_network_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive network health analytics for the current user"""
    
    # Get or create analytics record
    analytics = db.query(NetworkAnalytics).filter(
        NetworkAnalytics.user_id == current_user.id
    ).first()
    
    if not analytics:
        # Create new analytics record with calculated values
        analytics = await calculate_network_health(current_user.id, db)
    
    # Get connections for additional insights
    connections = db.query(Connection).filter(Connection.user_id == current_user.id).all()
    
    # Calculate additional metrics
    growth_data = calculate_growth_metrics(connections)
    industry_distribution = calculate_industry_distribution(connections, db)
    geographic_distribution = calculate_geographic_distribution(connections)
    
    return {
        "healthScore": analytics.health_score,
        "diversityScore": analytics.diversity_score,
        "strengthScore": analytics.strength_score,
        "networkSize": analytics.network_size,
        "industriesCount": analytics.industries_count,
        "companiesCount": analytics.companies_count,
        "seniorConnections": analytics.senior_connections,
        "growthRate": analytics.growth_rate,
        "lastCalculated": analytics.last_calculated.isoformat(),
        "growthData": growth_data,
        "industryDistribution": industry_distribution,
        "geographicDistribution": geographic_distribution,
        "recommendations": get_network_recommendations(current_user.id, analytics)
    }

@router.get("/insights")
async def get_network_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get network insights and recommendations"""
    
    connections = db.query(Connection).filter(Connection.user_id == current_user.id).all()
    
    insights = {
        "connectionOpportunities": generate_connection_opportunities(connections, db),
        "networkGaps": identify_network_gaps(connections, db),
        "strengthenConnections": suggest_connection_strengthening(connections),
        "industryExpansion": suggest_industry_expansion(connections, db),
        "careerOpportunities": identify_career_opportunities(connections, db)
    }
    
    return insights

@router.post("/recalculate")
async def recalculate_network_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually recalculate network health metrics"""
    
    analytics = await calculate_network_health(current_user.id, db)
    
    return {
        "message": "Network health recalculated successfully",
        "healthScore": analytics.health_score,
        "lastCalculated": analytics.last_calculated.isoformat()
    }

async def calculate_network_health(user_id: int, db: Session) -> NetworkAnalytics:
    """Calculate comprehensive network health score"""
    
    connections = db.query(Connection).filter(Connection.user_id == user_id).all()
    
    if not connections:
        # No connections - create default analytics
        analytics = NetworkAnalytics(
            user_id=user_id,
            health_score=0,
            diversity_score=0,
            strength_score=0,
            network_size=0,
            industries_count=0,
            companies_count=0,
            senior_connections=0,
            growth_rate=0.0
        )
        db.add(analytics)
        db.commit()
        return analytics
    
    # Calculate metrics
    network_size = len(connections)
    industries = set()
    companies = set()
    senior_connections = 0
    total_strength = 0
    
    for conn in connections:
        if conn.company:
            if conn.company.industry:
                industries.add(conn.company.industry)
            companies.add(conn.company.name)
        
        # Count senior connections (titles containing senior, director, vp, etc.)
        if conn.title and any(title in conn.title.lower() for title in 
                             ['senior', 'director', 'vp', 'vice president', 'head', 'lead', 'manager']):
            senior_connections += 1
        
        # Use relationship strength (default to 5 if not set)
        total_strength += getattr(conn, 'relationship_strength', 5)
    
    # Calculate scores
    diversity_score = min(len(industries) * 8, 100)  # Cap at 100
    strength_score = min((total_strength / network_size) * 10, 100) if network_size > 0 else 0
    size_score = min(network_size * 2, 100)  # 50 connections = 100 score
    
    # Overall health score (weighted average)
    health_score = round((diversity_score * 0.3 + strength_score * 0.4 + size_score * 0.3))
    
    # Calculate growth rate (mock for now - would need historical data)
    growth_rate = min(network_size * 0.5, 15.0)  # Cap at 15%
    
    # Update or create analytics record
    analytics = db.query(NetworkAnalytics).filter(
        NetworkAnalytics.user_id == user_id
    ).first()
    
    if analytics:
        analytics.health_score = health_score
        analytics.diversity_score = round(diversity_score)
        analytics.strength_score = round(strength_score)
        analytics.network_size = network_size
        analytics.industries_count = len(industries)
        analytics.companies_count = len(companies)
        analytics.senior_connections = senior_connections
        analytics.growth_rate = growth_rate
        analytics.last_calculated = datetime.utcnow()
    else:
        analytics = NetworkAnalytics(
            user_id=user_id,
            health_score=health_score,
            diversity_score=round(diversity_score),
            strength_score=round(strength_score),
            network_size=network_size,
            industries_count=len(industries),
            companies_count=len(companies),
            senior_connections=senior_connections,
            growth_rate=growth_rate,
            last_calculated=datetime.utcnow()
        )
        db.add(analytics)
    
    db.commit()
    db.refresh(analytics)
    return analytics

def calculate_growth_metrics(connections: List) -> List[Dict]:
    """Calculate network growth over time (mock data for now)"""
    return [
        {"month": "Jan", "connections": 15},
        {"month": "Feb", "connections": 23},
        {"month": "Mar", "connections": 35},
        {"month": "Apr", "connections": 42},
        {"month": "May", "connections": len(connections)}
    ]

def calculate_industry_distribution(connections: List, db: Session) -> List[Dict]:
    """Calculate industry distribution of connections"""
    industry_count = {}
    
    for conn in connections:
        if conn.company and conn.company.industry:
            industry = conn.company.industry
            industry_count[industry] = industry_count.get(industry, 0) + 1
    
    return [
        {"industry": industry, "count": count, "percentage": round((count / len(connections)) * 100, 1)}
        for industry, count in sorted(industry_count.items(), key=lambda x: x[1], reverse=True)
    ]

def calculate_geographic_distribution(connections: List) -> List[Dict]:
    """Calculate geographic distribution (mock data for now)"""
    return [
        {"location": "San Francisco Bay Area", "count": 15, "percentage": 35.7},
        {"location": "New York", "count": 8, "percentage": 19.0},
        {"location": "Los Angeles", "count": 6, "percentage": 14.3},
        {"location": "Seattle", "count": 4, "percentage": 9.5},
        {"location": "Other", "count": 9, "percentage": 21.4}
    ]

def get_network_recommendations(user_id: int, analytics: NetworkAnalytics) -> List[Dict]:
    """Generate personalized network recommendations"""
    recommendations = []
    
    if analytics.health_score < 70:
        if analytics.diversity_score < 50:
            recommendations.append({
                "type": "diversity",
                "title": "Expand Industry Diversity",
                "description": "Connect with professionals in emerging tech sectors",
                "priority": "high",
                "estimatedImpact": "15-20 point health score increase"
            })
        
        if analytics.strength_score < 60:
            recommendations.append({
                "type": "engagement",
                "title": "Strengthen Existing Connections",
                "description": "Reach out to dormant connections with personalized messages",
                "priority": "medium",
                "estimatedImpact": "10-15 point health score increase"
            })
        
        if analytics.network_size < 30:
            recommendations.append({
                "type": "growth",
                "title": "Expand Network Size",
                "description": "Add 10-15 strategic connections in your target companies",
                "priority": "high",
                "estimatedImpact": "20-25 point health score increase"
            })
    
    return recommendations

def generate_connection_opportunities(connections: List, db: Session) -> List[Dict]:
    """Generate connection opportunities"""
    return [
        {
            "type": "mutual_connection",
            "title": "Connect through mutual connections",
            "description": "5 potential connections through existing network",
            "priority": "high"
        },
        {
            "type": "industry_expansion", 
            "title": "Expand into AI/ML industry",
            "description": "Growing sector with high opportunity potential",
            "priority": "medium"
        }
    ]

def identify_network_gaps(connections: List, db: Session) -> List[Dict]:
    """Identify gaps in network coverage"""
    return [
        {
            "gap": "Senior Leadership",
            "description": "Limited connections at C-level and VP level",
            "impact": "high",
            "suggestions": ["Target VPs at portfolio companies", "Attend executive networking events"]
        },
        {
            "gap": "International Presence",
            "description": "Most connections are US-based",
            "impact": "medium", 
            "suggestions": ["Connect with European tech hubs", "Join international professional groups"]
        }
    ]

def suggest_connection_strengthening(connections: List) -> List[Dict]:
    """Suggest ways to strengthen existing connections"""
    return [
        {
            "connection": "Sarah Chen",
            "lastInteraction": "3 months ago",
            "suggestion": "Congratulate on recent promotion to VP",
            "priority": "high"
        },
        {
            "connection": "Michael Rodriguez",
            "lastInteraction": "6 months ago", 
            "suggestion": "Share relevant industry article about AI trends",
            "priority": "medium"
        }
    ]

def suggest_industry_expansion(connections: List, db: Session) -> List[Dict]:
    """Suggest industry expansion opportunities"""
    return [
        {
            "industry": "Artificial Intelligence",
            "currentConnections": 3,
            "targetConnections": 8,
            "reasoning": "High growth sector with strong job market",
            "priority": "high"
        },
        {
            "industry": "FinTech",
            "currentConnections": 1,
            "targetConnections": 5,
            "reasoning": "Emerging opportunities in blockchain and digital payments",
            "priority": "medium"
        }
    ]

def identify_career_opportunities(connections: List, db: Session) -> List[Dict]:
    """Identify potential career opportunities through connections"""
    return [
        {
            "company": "TechCorp",
            "position": "Senior Product Manager",
            "connections": ["Alex Thompson", "Maria Garcia"],
            "matchScore": 92,
            "reasoning": "Strong PM background + 2 connections at company"
        },
        {
            "company": "StartupCo",
            "position": "VP of Engineering", 
            "connections": ["David Chen"],
            "matchScore": 88,
            "reasoning": "Leadership experience + connection to hiring manager"
        }
    ]