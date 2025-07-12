from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.user import User
from ..models.connection import Connection
from ..schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ConnectionResponse])
def read_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connections = db.query(Connection).filter(Connection.user_id == current_user.id).all()
    return connections

@router.post("/", response_model=ConnectionResponse)
def create_connection(
    connection: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_connection = Connection(
        user_id=current_user.id,
        **connection.dict()
    )
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

@router.get("/{connection_id}", response_model=ConnectionResponse)
def read_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    return connection

@router.put("/{connection_id}", response_model=ConnectionResponse)
def update_connection(
    connection_id: int,
    connection_update: ConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    for field, value in connection_update.dict(exclude_unset=True).items():
        setattr(connection, field, value)
    
    db.commit()
    db.refresh(connection)
    return connection

@router.delete("/{connection_id}")
def delete_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id,
        Connection.user_id == current_user.id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    db.delete(connection)
    db.commit()
    return {"message": "Connection deleted successfully"}

@router.post("/import")
def import_connections(
    platform_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import connections from connected platforms"""
    from ..models.user import UserPlatformAccount, Platform
    
    # If no platform specified, import from all connected platforms
    if platform_id:
        platform_accounts = db.query(UserPlatformAccount).filter(
            UserPlatformAccount.user_id == current_user.id,
            UserPlatformAccount.platform_id == platform_id,
            UserPlatformAccount.is_active == True
        ).all()
    else:
        platform_accounts = db.query(UserPlatformAccount).filter(
            UserPlatformAccount.user_id == current_user.id,
            UserPlatformAccount.is_active == True
        ).all()
    
    if not platform_accounts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No connected platforms found"
        )
    
    imported_count = 0
    import_results = []
    
    for account in platform_accounts:
        platform = db.query(Platform).filter(Platform.id == account.platform_id).first()
        
        if platform.name == "LinkedIn":
            connections_data = _simulate_linkedin_import(current_user.first_name, current_user.last_name)
        elif platform.name == "Facebook":
            connections_data = _simulate_facebook_import(current_user.first_name)
        elif platform.name == "Twitter":
            connections_data = _simulate_twitter_import(current_user.username)
        elif platform.name == "Instagram":
            connections_data = _simulate_instagram_import(current_user.username)
        else:
            connections_data = []
        
        platform_imported = 0
        for conn_data in connections_data:
            # Check if connection already exists
            existing = db.query(Connection).filter(
                Connection.user_id == current_user.id,
                Connection.platform_id == account.platform_id,
                Connection.connection_name == conn_data["name"]
            ).first()
            
            if not existing:
                new_connection = Connection(
                    user_id=current_user.id,
                    platform_id=account.platform_id,
                    connection_name=conn_data["name"],
                    connection_profile_url=conn_data.get("profile_url", ""),
                    connection_title=conn_data.get("title", ""),
                    connection_company=conn_data.get("company", ""),
                    connection_location=conn_data.get("location", ""),
                    relationship_strength=conn_data.get("relationship_strength", 3),
                    mutual_connections_count=conn_data.get("mutual_connections", 0)
                )
                db.add(new_connection)
                platform_imported += 1
        
        imported_count += platform_imported
        import_results.append({
            "platform": platform.name,
            "imported": platform_imported
        })
        
        # Update last sync time
        from datetime import datetime
        account.last_sync_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": f"Successfully imported {imported_count} connections",
        "total_imported": imported_count,
        "platforms": import_results
    }

def _simulate_linkedin_import(first_name: str, last_name: str):
    """Simulate LinkedIn connections import with realistic professional data"""
    import random
    
    # Professional titles and companies for realistic simulation
    titles = [
        "Software Engineer", "Product Manager", "Data Scientist", "Marketing Director",
        "Sales Manager", "UX Designer", "Business Analyst", "CEO", "CTO", "VP Engineering",
        "Senior Developer", "Project Manager", "Operations Manager", "HR Director",
        "Financial Analyst", "Consultant", "Account Executive", "Research Scientist"
    ]
    
    companies = [
        "Google", "Microsoft", "Apple", "Meta", "Amazon", "Netflix", "Tesla", "Spotify",
        "Airbnb", "Uber", "LinkedIn", "Salesforce", "Adobe", "Intel", "Oracle", "IBM",
        "Accenture", "Deloitte", "McKinsey", "Goldman Sachs", "JPMorgan", "Startup Inc",
        "Tech Solutions LLC", "Innovation Labs", "Digital Ventures", "Global Systems"
    ]
    
    locations = [
        "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
        "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Atlanta, GA", "Remote"
    ]
    
    # Generate 15-25 realistic connections
    connections = []
    num_connections = random.randint(15, 25)
    
    first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    
    for i in range(num_connections):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        connections.append({
            "name": f"{fname} {lname}",
            "profile_url": f"https://linkedin.com/in/{fname.lower()}-{lname.lower()}-{random.randint(100,999)}",
            "title": random.choice(titles),
            "company": random.choice(companies),
            "location": random.choice(locations),
            "relationship_strength": random.randint(3, 5),
            "mutual_connections": random.randint(0, 15)
        })
    
    return connections

def _simulate_facebook_import(first_name: str):
    """Simulate Facebook connections (more personal/social)"""
    import random
    
    connections = []
    num_connections = random.randint(8, 15)
    
    names = [
        "Sarah Wilson", "Mike Chen", "Emma Rodriguez", "David Kim", "Lisa Thompson",
        "James Park", "Maria Gonzalez", "Chris Anderson", "Jennifer Lee", "Ryan Taylor"
    ]
    
    for i in range(num_connections):
        name = random.choice(names)
        connections.append({
            "name": name,
            "profile_url": f"https://facebook.com/{name.replace(' ', '.').lower()}",
            "title": "Friend",
            "company": "",
            "location": random.choice(["Hometown", "Current City", "Nearby"]),
            "relationship_strength": random.randint(2, 4),
            "mutual_connections": random.randint(5, 25)
        })
    
    return connections

def _simulate_twitter_import(username: str):
    """Simulate Twitter connections (followers/following)"""
    import random
    
    connections = []
    num_connections = random.randint(10, 20)
    
    twitter_handles = [
        "@tech_leader", "@startup_founder", "@data_guru", "@design_pro", "@marketing_maven",
        "@code_ninja", "@business_mind", "@innovation_hub", "@future_tech", "@growth_hacker"
    ]
    
    for handle in twitter_handles[:num_connections]:
        connections.append({
            "name": handle,
            "profile_url": f"https://twitter.com/{handle[1:]}",
            "title": "Twitter Connection",
            "company": "",
            "location": "Twitter",
            "relationship_strength": random.randint(1, 3),
            "mutual_connections": random.randint(0, 50)
        })
    
    return connections

def _simulate_instagram_import(username: str):
    """Simulate Instagram connections"""
    import random
    
    connections = []
    num_connections = random.randint(5, 12)
    
    for i in range(num_connections):
        handle = f"@user_{random.randint(100, 999)}"
        connections.append({
            "name": handle,
            "profile_url": f"https://instagram.com/{handle[1:]}",
            "title": "Instagram Connection",
            "company": "",
            "location": "Instagram",
            "relationship_strength": random.randint(1, 3),
            "mutual_connections": random.randint(0, 20)
        })
    
    return connections