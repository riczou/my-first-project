#!/usr/bin/env python3
"""
Network Health Calculator Cron Job
Recalculates network health scores for all users daily
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db
from app.models.user import User
from app.models.connection import Connection
from app.models.analytics import NetworkAnalytics
import logging
from datetime import datetime
from sqlalchemy import func

# Setup logging
logging.basicConfig(
    filename='/var/log/connectme/network_health.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def calculate_network_health(user_id: int, db) -> dict:
    """Calculate comprehensive network health score"""
    
    # Get user's connections
    connections = db.query(Connection).filter(Connection.user_id == user_id).all()
    
    if not connections:
        return {"health_score": 0, "diversity_score": 0, "strength_score": 0}
    
    # Industry diversity score
    industries = set([conn.company.industry for conn in connections if conn.company])
    diversity_score = min(len(industries) * 10, 100)  # Cap at 100
    
    # Connection strength score
    total_strength = sum([conn.relationship_strength or 5 for conn in connections])
    avg_strength = total_strength / len(connections)
    strength_score = min(avg_strength * 10, 100)
    
    # Network size score
    size_score = min(len(connections) * 2, 100)  # 50 connections = 100 score
    
    # Overall health score (weighted average)
    health_score = (diversity_score * 0.3 + strength_score * 0.4 + size_score * 0.3)
    
    return {
        "health_score": round(health_score),
        "diversity_score": round(diversity_score),
        "strength_score": round(strength_score),
        "network_size": len(connections),
        "industries_count": len(industries)
    }

def main():
    """Recalculate network health for all active users"""
    try:
        db = next(get_db())
        
        # Get all active users
        active_users = db.query(User).filter(User.is_active == True).all()
        
        logging.info(f"Calculating network health for {len(active_users)} users")
        
        for user in active_users:
            try:
                # Calculate health metrics
                health_data = calculate_network_health(user.id, db)
                
                # Update or create analytics record
                analytics = db.query(NetworkAnalytics).filter(
                    NetworkAnalytics.user_id == user.id
                ).first()
                
                if analytics:
                    analytics.health_score = health_data["health_score"]
                    analytics.diversity_score = health_data["diversity_score"]
                    analytics.strength_score = health_data["strength_score"]
                    analytics.network_size = health_data["network_size"]
                    analytics.last_calculated = datetime.now()
                else:
                    analytics = NetworkAnalytics(
                        user_id=user.id,
                        health_score=health_data["health_score"],
                        diversity_score=health_data["diversity_score"],
                        strength_score=health_data["strength_score"],
                        network_size=health_data["network_size"],
                        last_calculated=datetime.now()
                    )
                    db.add(analytics)
                
                db.commit()
                logging.info(f"Updated health score for user {user.id}: {health_data['health_score']}")
                
            except Exception as e:
                logging.error(f"Failed to calculate health for user {user.id}: {e}")
                db.rollback()
                continue
        
        logging.info("Network health calculation job completed successfully")
        
    except Exception as e:
        logging.error(f"Network health calculation job failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()