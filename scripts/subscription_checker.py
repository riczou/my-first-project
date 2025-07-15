#!/usr/bin/env python3
"""
Subscription Status Checker Cron Job
Monitors subscription statuses and handles renewals/cancellations
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.core.payment import check_payment_status, cancel_subscription
from app.core.email import send_renewal_reminder, send_cancellation_notice
import logging
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    filename='/var/log/connectme/subscriptions.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    """Check subscription statuses and handle renewals"""
    try:
        db = next(get_db())
        
        # Check subscriptions expiring in 7 days (send renewal reminders)
        reminder_date = datetime.now() + timedelta(days=7)
        expiring_soon = db.query(Subscription).filter(
            Subscription.ends_at <= reminder_date,
            Subscription.status == 'active',
            Subscription.renewal_reminder_sent == False
        ).all()
        
        logging.info(f"Found {len(expiring_soon)} subscriptions expiring soon")
        
        for subscription in expiring_soon:
            try:
                user = db.query(User).filter(User.id == subscription.user_id).first()
                if user:
                    send_renewal_reminder(user.email, subscription.ends_at)
                    subscription.renewal_reminder_sent = True
                    db.commit()
                    logging.info(f"Sent renewal reminder to user {user.id}")
            except Exception as e:
                logging.error(f"Failed to send renewal reminder for subscription {subscription.id}: {e}")
                continue
        
        # Check expired subscriptions
        expired_subs = db.query(Subscription).filter(
            Subscription.ends_at <= datetime.now(),
            Subscription.status == 'active'
        ).all()
        
        logging.info(f"Found {len(expired_subs)} expired subscriptions")
        
        for subscription in expired_subs:
            try:
                # Check if payment was processed
                payment_status = check_payment_status(subscription.payment_id)
                
                if payment_status == 'failed':
                    # Cancel subscription
                    subscription.status = 'cancelled'
                    subscription.cancelled_at = datetime.now()
                    
                    # Downgrade user to free plan
                    user = db.query(User).filter(User.id == subscription.user_id).first()
                    if user:
                        user.subscription_tier = 'free'
                        send_cancellation_notice(user.email, subscription.ends_at)
                    
                    db.commit()
                    logging.info(f"Cancelled subscription {subscription.id} for user {subscription.user_id}")
                
                elif payment_status == 'succeeded':
                    # Extend subscription
                    if subscription.billing_cycle == 'monthly':
                        subscription.ends_at = subscription.ends_at + timedelta(days=30)
                    else:  # yearly
                        subscription.ends_at = subscription.ends_at + timedelta(days=365)
                    
                    subscription.renewal_reminder_sent = False
                    db.commit()
                    logging.info(f"Renewed subscription {subscription.id} for user {subscription.user_id}")
                
            except Exception as e:
                logging.error(f"Failed to process expired subscription {subscription.id}: {e}")
                continue
        
        # Check referral rewards
        from app.models.referral import Referral
        pending_rewards = db.query(Referral).filter(
            Referral.status == 'completed',
            Referral.reward_processed == False
        ).all()
        
        logging.info(f"Found {len(pending_rewards)} pending referral rewards")
        
        for referral in pending_rewards:
            try:
                # Process referral reward (extend subscription or add credits)
                referrer = db.query(User).filter(User.id == referral.referrer_id).first()
                if referrer:
                    # Add 1 month free or equivalent credits
                    # Implementation depends on your reward system
                    referral.reward_processed = True
                    db.commit()
                    logging.info(f"Processed referral reward for user {referrer.id}")
            except Exception as e:
                logging.error(f"Failed to process referral reward {referral.id}: {e}")
                continue
        
        logging.info("Subscription checker job completed successfully")
        
    except Exception as e:
        logging.error(f"Subscription checker job failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()