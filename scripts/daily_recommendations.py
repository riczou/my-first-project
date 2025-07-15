#!/usr/bin/env python3
"""
Daily Connection Recommendations Cron Job
Sends personalized connection suggestions to active users
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db
from app.models.user import User
from app.models.connection import Connection
from app.core.recommendations import generate_recommendations
from app.core.email import send_recommendation_email
import logging
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    filename='/var/log/connectme/daily_recommendations.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    """Send daily recommendations to active users"""
    try:
        db = next(get_db())
        
        # Get active users who haven't received recommendations in 24 hours
        cutoff_time = datetime.now() - timedelta(hours=24)
        active_users = db.query(User).filter(
            User.is_active == True,
            User.last_recommendation_sent < cutoff_time
        ).all()
        
        logging.info(f"Processing recommendations for {len(active_users)} users")
        
        for user in active_users:
            try:
                # Generate personalized recommendations
                recommendations = generate_recommendations(user.id, limit=5)
                
                if recommendations:
                    # Send email with recommendations
                    send_recommendation_email(user.email, recommendations)
                    
                    # Update last sent timestamp
                    user.last_recommendation_sent = datetime.now()
                    db.commit()
                    
                    logging.info(f"Sent recommendations to user {user.id}")
                
            except Exception as e:
                logging.error(f"Failed to send recommendations to user {user.id}: {e}")
                continue
        
        logging.info("Daily recommendations job completed successfully")
        
    except Exception as e:
        logging.error(f"Daily recommendations job failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()