from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import csv
import io
from ..core.database import get_db
from ..models.user import User, Platform, UserPlatformAccount
from ..models.connection import Connection
from ..models.analytics import NetworkAnalytics
from ..api.auth import get_current_admin_user

router = APIRouter()

@router.get("/dashboard/overview",
    summary="Get admin dashboard overview",
    description="Get high-level business metrics and KPIs for the admin dashboard"
)
def get_dashboard_overview(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get dashboard overview metrics"""
    
    # Total users
    total_users = db.query(User).count()
    
    # Active users (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(User).filter(
        User.updated_at >= thirty_days_ago
    ).count()
    
    # New users this month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_users_this_month = db.query(User).filter(
        User.created_at >= start_of_month
    ).count()
    
    # Total connections
    total_connections = db.query(Connection).count()
    
    # Connections this month
    new_connections_this_month = db.query(Connection).filter(
        Connection.created_at >= start_of_month
    ).count()
    
    # Platform distribution
    platform_stats = db.query(
        Platform.name,
        func.count(UserPlatformAccount.id).label('connected_users')
    ).join(UserPlatformAccount).group_by(Platform.name).all()
    
    # User growth over last 12 months
    user_growth = []
    for i in range(12):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=30*i)).replace(hour=0, minute=0, second=0, microsecond=0)
        month_end = month_start.replace(month=month_start.month % 12 + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
        
        users_count = db.query(User).filter(
            and_(User.created_at >= month_start, User.created_at < month_end)
        ).count()
        
        user_growth.append({
            "month": month_start.strftime("%Y-%m"),
            "new_users": users_count
        })
    
    user_growth.reverse()  # Show oldest to newest
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_this_month": new_users_this_month,
        "total_connections": total_connections,
        "new_connections_this_month": new_connections_this_month,
        "platform_distribution": [
            {"platform": stat.name, "users": stat.connected_users}
            for stat in platform_stats
        ],
        "user_growth": user_growth,
        "activity_rate": round((active_users / total_users * 100) if total_users > 0 else 0, 1)
    }

@router.get("/users/analytics",
    summary="Get detailed user analytics",
    description="Get comprehensive user analytics including signup trends, engagement, and retention"
)
def get_user_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed user analytics"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Daily signups
    daily_signups = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        signups = db.query(User).filter(
            and_(User.created_at >= day_start, User.created_at < day_end)
        ).count()
        
        daily_signups.append({
            "date": day.strftime("%Y-%m-%d"),
            "signups": signups
        })
    
    # Subscription tier distribution
    subscription_stats = db.query(
        User.subscription_tier,
        func.count(User.id).label('count')
    ).group_by(User.subscription_tier).all()
    
    # User status distribution
    status_stats = db.query(
        User.is_active,
        User.is_verified,
        func.count(User.id).label('count')
    ).group_by(User.is_active, User.is_verified).all()
    
    # Average connections per user - fix SQL aggregate issue
    total_users_with_connections = db.query(func.count(func.distinct(Connection.user_id))).scalar() or 1
    total_connections = db.query(func.count(Connection.id)).scalar() or 0
    avg_connections = round(total_connections / total_users_with_connections, 2) if total_users_with_connections > 0 else 0
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        },
        "daily_signups": daily_signups,
        "subscription_distribution": [
            {"tier": stat.subscription_tier, "count": stat.count}
            for stat in subscription_stats
        ],
        "user_status": [
            {
                "active": stat.is_active,
                "verified": stat.is_verified,
                "count": stat.count
            }
            for stat in status_stats
        ],
        "average_connections_per_user": avg_connections
    }

@router.get("/connections/analytics",
    summary="Get connection analytics",
    description="Get insights about connections and network activity"
)
def get_connection_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get connection analytics"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Daily connections created
    daily_connections = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        connections = db.query(Connection).filter(
            and_(Connection.created_at >= day_start, Connection.created_at < day_end)
        ).count()
        
        daily_connections.append({
            "date": day.strftime("%Y-%m-%d"),
            "connections": connections
        })
    
    # Platform distribution of connections - handle case where no platforms exist
    try:
        platform_connections = db.query(
            Platform.name,
            func.count(Connection.id).label('count')
        ).join(Connection).group_by(Platform.name).all()
    except:
        platform_connections = []
    
    # Top users by connections
    try:
        top_users = db.query(
            User.username,
            User.first_name,
            User.last_name,
            func.count(Connection.id).label('connection_count')
        ).join(Connection).group_by(
            User.id, User.username, User.first_name, User.last_name
        ).order_by(desc('connection_count')).limit(10).all()
    except:
        top_users = []
    
    # Connection strength distribution
    strength_distribution = db.query(
        Connection.relationship_strength,
        func.count(Connection.id).label('count')
    ).group_by(Connection.relationship_strength).all()
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        },
        "daily_connections": daily_connections,
        "platform_distribution": [
            {"platform": stat.name, "connections": stat.count}
            for stat in platform_connections
        ],
        "top_users_by_connections": [
            {
                "username": user.username,
                "name": f"{user.first_name} {user.last_name}",
                "connection_count": user.connection_count
            }
            for user in top_users
        ],
        "relationship_strength_distribution": [
            {"strength": stat.relationship_strength, "count": stat.count}
            for stat in strength_distribution
        ]
    }

@router.get("/users/list",
    summary="Get user list with pagination",
    description="Get paginated list of users with search and filter capabilities"
)
def get_users_list(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by username, email, or name"),
    subscription_tier: Optional[str] = Query(None, description="Filter by subscription tier"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get paginated user list with filters"""
    
    # Base query
    query = db.query(User)
    
    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            User.username.ilike(search_filter) |
            User.email.ilike(search_filter) |
            User.first_name.ilike(search_filter) |
            User.last_name.ilike(search_filter)
        )
    
    # Apply filters
    if subscription_tier:
        query = query.filter(User.subscription_tier == subscription_tier)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    
    # Get connection counts for each user
    user_data = []
    for user in users:
        connection_count = db.query(Connection).filter(Connection.user_id == user.id).count()
        platform_count = db.query(UserPlatformAccount).filter(
            UserPlatformAccount.user_id == user.id,
            UserPlatformAccount.is_active == True
        ).count()
        
        user_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "connection_count": connection_count,
            "connected_platforms": platform_count
        })
    
    return {
        "users": user_data,
        "pagination": {
            "current_page": page,
            "total_pages": (total_count + limit - 1) // limit,
            "total_count": total_count,
            "has_next": offset + limit < total_count,
            "has_previous": page > 1
        }
    }

@router.get("/platforms/stats",
    summary="Get platform statistics",
    description="Get detailed statistics about platform usage and engagement"
)
def get_platform_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get platform usage statistics"""
    
    # Platform connection stats
    platform_stats = db.query(
        Platform.id,
        Platform.name,
        func.count(UserPlatformAccount.id).label('connected_users'),
        func.count(Connection.id).label('total_connections')
    ).outerjoin(UserPlatformAccount).outerjoin(Connection).group_by(
        Platform.id, Platform.name
    ).all()
    
    # Recent platform connections (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_connections = db.query(
        Platform.name,
        func.count(UserPlatformAccount.id).label('new_connections')
    ).join(UserPlatformAccount).filter(
        UserPlatformAccount.last_sync_at >= thirty_days_ago
    ).group_by(Platform.name).all()
    
    recent_dict = {stat.name: stat.new_connections for stat in recent_connections}
    
    return {
        "platform_overview": [
            {
                "platform_id": stat.id,
                "platform_name": stat.name,
                "connected_users": stat.connected_users,
                "total_connections": stat.total_connections,
                "recent_connections": recent_dict.get(stat.name, 0)
            }
            for stat in platform_stats
        ],
        "total_platforms": len(platform_stats),
        "most_popular_platform": max(platform_stats, key=lambda x: x.connected_users).name if platform_stats else None
    }

@router.get("/users/export/csv",
    summary="Export users list as CSV",
    description="Download all users data as a CSV file for analysis or backup"
)
def export_users_csv(
    search: Optional[str] = Query(None, description="Search by username, email, or name"),
    subscription_tier: Optional[str] = Query(None, description="Filter by subscription tier"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Export users data as CSV file"""
    
    # Base query - same as get_users_list but without pagination
    query = db.query(User)
    
    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            User.username.ilike(search_filter) |
            User.email.ilike(search_filter) |
            User.first_name.ilike(search_filter) |
            User.last_name.ilike(search_filter)
        )
    
    # Apply filters
    if subscription_tier:
        query = query.filter(User.subscription_tier == subscription_tier)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Get all users (no pagination for export)
    users = query.order_by(desc(User.created_at)).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV headers
    headers = [
        'ID', 'Username', 'Email', 'First Name', 'Last Name',
        'Subscription Tier', 'Subscription Status', 'Is Active', 'Is Verified', 'Is Admin',
        'Connection Count', 'Connected Platforms', 'Created At', 'Updated At'
    ]
    writer.writerow(headers)
    
    # Write user data
    for user in users:
        # Get connection and platform counts for each user
        connection_count = db.query(Connection).filter(Connection.user_id == user.id).count()
        platform_count = db.query(UserPlatformAccount).filter(
            UserPlatformAccount.user_id == user.id,
            UserPlatformAccount.is_active == True
        ).count()
        
        row = [
            user.id,
            user.username,
            user.email,
            user.first_name,
            user.last_name,
            user.subscription_tier,
            user.subscription_status,
            user.is_active,
            user.is_verified,
            user.is_admin,
            connection_count,
            platform_count,
            user.created_at.isoformat() if user.created_at else '',
            user.updated_at.isoformat() if user.updated_at else ''
        ]
        writer.writerow(row)
    
    # Create response
    output.seek(0)
    
    # Generate filename with current timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"users_export_{timestamp}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )