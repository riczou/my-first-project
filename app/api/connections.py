from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
from ..core.database import get_db
from ..models.user import User
from ..models.connection import Connection
from ..schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ConnectionResponse])
def read_connections(
    company: Optional[str] = Query(None, description="Filter by company name"),
    role: Optional[str] = Query(None, description="Filter by job title/role"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Connection).filter(Connection.user_id == current_user.id)
    
    if company:
        query = query.filter(Connection.connection_company.ilike(f"%{company}%"))
    
    if role:
        query = query.filter(Connection.connection_title.ilike(f"%{role}%"))
    
    connections = query.all()
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

@router.post("/upload-csv")
def upload_csv_connections(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload connections from CSV file"""
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )
    
    try:
        # Read CSV content
        content = file.file.read()
        csv_data = content.decode('utf-8')
        
        # Handle LinkedIn CSV format which starts with Notes section
        lines = csv_data.split('\n')
        header_found = False
        clean_lines = []
        
        for line in lines:
            # Skip empty lines and LinkedIn notes section
            if not line.strip():
                continue
            # Look for actual CSV header (must contain comma-separated headers)
            if not header_found and ',' in line:
                # Check if this looks like a real CSV header line (multiple comma-separated values)
                parts = [part.strip().strip('"') for part in line.split(',')]
                if len(parts) >= 3 and any(header.lower() in [p.lower() for p in parts] for header in ['first name', 'last name', 'company', 'position', 'name']):
                    header_found = True
            if header_found:
                clean_lines.append(line)
        
        # Rejoin cleaned CSV data
        clean_csv_data = '\n'.join(clean_lines)
        csv_reader = csv.DictReader(io.StringIO(clean_csv_data))
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # start=2 because row 1 is header
            try:
                # Map CSV columns to our fields (flexible mapping)
                # Handle LinkedIn export format specifically: "First Name,Last Name,URL,Email Address,Company,Position,Connected On"
                name = _get_csv_value(row, ['name', 'full_name', 'contact_name', 'first_name'])
                if not name:
                    # LinkedIn format: combine First Name + Last Name
                    first = _get_csv_value(row, ['first_name', 'first name'])
                    last = _get_csv_value(row, ['last_name', 'last name']) 
                    if first or last:
                        name = f"{first or ''} {last or ''}".strip()
                
                company = _get_csv_value(row, ['company', 'organization', 'employer', 'current_company'])
                title = _get_csv_value(row, ['title', 'position', 'job_title', 'role'])
                email = _get_csv_value(row, ['email', 'email_address', 'email address'])
                location = _get_csv_value(row, ['location', 'city', 'address'])
                profile_url = _get_csv_value(row, ['profile_url', 'linkedin_url', 'url', 'link'])
                
                # Skip if no name
                if not name:
                    errors.append(f"Row {row_num}: Missing name")
                    continue
                
                # Check if connection already exists
                existing = db.query(Connection).filter(
                    Connection.user_id == current_user.id,
                    Connection.connection_name == name
                ).first()
                
                if existing:
                    continue  # Skip duplicates
                
                # Create new connection
                new_connection = Connection(
                    user_id=current_user.id,
                    platform_id=None,  # CSV import doesn't have platform
                    connection_name=name,
                    connection_profile_url=profile_url or "",
                    connection_title=title or "",
                    connection_company=company or "",
                    connection_location=location or "",
                    relationship_strength=3,  # Default value
                    mutual_connections_count=0  # Not available in CSV
                )
                
                db.add(new_connection)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        db.commit()
        
        return {
            "message": f"Successfully imported {imported_count} connections from CSV",
            "imported_count": imported_count,
            "errors": errors[:10] if errors else [],  # Return max 10 errors
            "total_errors": len(errors)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing CSV file: {str(e)}"
        )
    finally:
        file.file.close()

def _get_csv_value(row, possible_keys):
    """Get value from CSV row using multiple possible column names"""
    for key in possible_keys:
        # Try exact match first
        if key in row and row[key]:
            return row[key].strip()
        # Try case-insensitive match
        for actual_key in row.keys():
            if actual_key.lower() == key.lower() and row[actual_key]:
                return row[actual_key].strip()
    return None

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