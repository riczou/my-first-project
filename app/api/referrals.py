from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel, EmailStr
from ..core.database import get_db
from ..core.security import get_current_user
from ..models import User, Referral, ReferralStats, ReferralReward
from datetime import datetime, timedelta
import uuid
import secrets

router = APIRouter()

class ReferralInvite(BaseModel):
    email: EmailStr

class ReferralResponse(BaseModel):
    id: int
    email: str
    status: str
    date_invited: datetime
    date_signed_up: datetime = None
    reward_earned: float

@router.get("/stats")
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive referral statistics for the current user"""
    
    # Get or create referral stats
    stats = db.query(ReferralStats).filter(
        ReferralStats.user_id == current_user.id
    ).first()
    
    if not stats:
        stats = ReferralStats(
            user_id=current_user.id,
            total_referrals=0,
            successful_referrals=0,
            total_earned=0.0,
            pending_rewards=0.0,
            current_streak=0,
            rank="Starter",
            rank_points=0
        )
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    # Get referral history
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.date_invited.desc()).all()
    
    # Calculate next milestone
    next_milestone = calculate_next_milestone(stats.successful_referrals)
    
    return {
        "totalReferrals": stats.total_referrals,
        "successfulReferrals": stats.successful_referrals,
        "totalEarned": stats.total_earned,
        "pendingRewards": stats.pending_rewards,
        "currentStreak": stats.current_streak,
        "rank": stats.rank,
        "nextMilestone": next_milestone,
        "referralCode": get_or_create_referral_code(current_user, db),
        "referrals": [
            {
                "id": r.id,
                "email": r.referred_email,
                "status": r.status,
                "dateInvited": r.date_invited.isoformat(),
                "dateJoined": r.date_signed_up.isoformat() if r.date_signed_up else None,
                "rewardEarned": r.reward_amount
            }
            for r in referrals
        ]
    }

@router.get("/code")
async def get_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get or create user's referral code"""
    
    code = get_or_create_referral_code(current_user, db)
    referral_url = f"https://connectme.com/register?ref={code}"
    
    return {
        "code": code,
        "url": referral_url
    }

@router.post("/invite")
async def send_referral_invite(
    invite: ReferralInvite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a referral invitation by email"""
    
    # Check if email already referred
    existing_referral = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.referred_email == invite.email
    ).first()
    
    if existing_referral:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already referred this email address"
        )
    
    # Create referral record
    referral_code = get_or_create_referral_code(current_user, db)
    
    referral = Referral(
        referrer_id=current_user.id,
        referred_email=invite.email,
        referral_code=referral_code,
        status="pending",
        date_invited=datetime.utcnow()
    )
    
    db.add(referral)
    
    # Update referral stats
    stats = db.query(ReferralStats).filter(
        ReferralStats.user_id == current_user.id
    ).first()
    
    if stats:
        stats.total_referrals += 1
    else:
        stats = ReferralStats(
            user_id=current_user.id,
            total_referrals=1,
            successful_referrals=0,
            total_earned=0.0,
            pending_rewards=0.0,
            current_streak=0,
            rank="Starter"
        )
        db.add(stats)
    
    db.commit()
    
    # TODO: Send actual email invitation
    # send_referral_email(invite.email, current_user.first_name, referral_code)
    
    return {
        "message": "Referral invitation sent successfully",
        "email": invite.email,
        "referralCode": referral_code
    }

@router.get("/rewards")
async def get_referral_rewards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available referral rewards and progress"""
    
    stats = db.query(ReferralStats).filter(
        ReferralStats.user_id == current_user.id
    ).first()
    
    successful_referrals = stats.successful_referrals if stats else 0
    
    rewards = [
        {
            "type": "free_month",
            "amount": 1,
            "description": "1 month free for each successful referral",
            "requirements": 1,
            "unlocked": successful_referrals >= 1,
            "progress": min(successful_referrals, 1)
        },
        {
            "type": "discount",
            "amount": 50,
            "description": "50% off for 3 months (5 referrals)",
            "requirements": 5,
            "unlocked": successful_referrals >= 5,
            "progress": min(successful_referrals, 5)
        },
        {
            "type": "upgrade",
            "amount": 1,
            "description": "Free upgrade to Executive plan (10 referrals)",
            "requirements": 10,
            "unlocked": successful_referrals >= 10,
            "progress": min(successful_referrals, 10)
        },
        {
            "type": "cash",
            "amount": 500,
            "description": "$500 cash reward (25 referrals)",
            "requirements": 25,
            "unlocked": successful_referrals >= 25,
            "progress": min(successful_referrals, 25)
        }
    ]
    
    return {"rewards": rewards}

@router.get("/leaderboard")
async def get_referral_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get referral leaderboard"""
    
    # Get top referrers (mock data for now)
    leaderboard = [
        {"rank": 1, "name": "Sarah Chen", "referrals": 47, "reward": "$1,410"},
        {"rank": 2, "name": "Michael Rodriguez", "referrals": 38, "reward": "$1,140"},
        {"rank": 3, "name": "Alex Thompson", "referrals": 29, "reward": "$870"},
        {"rank": 4, "name": f"{current_user.first_name} {current_user.last_name}", "referrals": 8, "reward": "$240", "isUser": True},
        {"rank": 5, "name": "Jessica Wang", "referrals": 22, "reward": "$660"},
    ]
    
    return {"leaderboard": leaderboard}

@router.post("/register-referral")
async def register_referral_signup(
    email: str,
    referral_code: str,
    db: Session = Depends(get_db)
):
    """Register when a referred user signs up (called during registration)"""
    
    # Find the referral record
    referral = db.query(Referral).filter(
        Referral.referral_code == referral_code,
        Referral.referred_email == email,
        Referral.status == "pending"
    ).first()
    
    if not referral:
        return {"message": "Referral not found or already processed"}
    
    # Update referral status
    referral.status = "signed_up"
    referral.date_signed_up = datetime.utcnow()
    referral.reward_amount = 15.0  # Partial reward for signup
    
    # Update referrer stats
    stats = db.query(ReferralStats).filter(
        ReferralStats.user_id == referral.referrer_id
    ).first()
    
    if stats:
        stats.current_streak += 1
        stats.pending_rewards += 15.0
    
    db.commit()
    
    return {"message": "Referral signup registered successfully"}

@router.post("/register-subscription")
async def register_referral_subscription(
    email: str,
    referral_code: str,
    db: Session = Depends(get_db)
):
    """Register when a referred user subscribes (called during subscription)"""
    
    # Find the referral record
    referral = db.query(Referral).filter(
        Referral.referral_code == referral_code,
        Referral.referred_email == email,
        Referral.status.in_(["pending", "signed_up"])
    ).first()
    
    if not referral:
        return {"message": "Referral not found"}
    
    # Update referral status
    referral.status = "subscribed"
    referral.date_subscribed = datetime.utcnow()
    referral.reward_amount = 30.0  # Full reward for subscription
    
    # Update referrer stats
    stats = db.query(ReferralStats).filter(
        ReferralStats.user_id == referral.referrer_id
    ).first()
    
    if stats:
        stats.successful_referrals += 1
        stats.total_earned += 30.0
        stats.pending_rewards = max(0, stats.pending_rewards - 15.0)  # Convert pending to earned
        
        # Update rank based on successful referrals
        stats.rank = calculate_rank(stats.successful_referrals)
        stats.rank_points = stats.successful_referrals * 10
    
    db.commit()
    
    return {"message": "Referral subscription registered successfully"}

def get_or_create_referral_code(user: User, db: Session) -> str:
    """Get existing referral code or create a new one"""
    
    if user.referral_code:
        return user.referral_code
    
    # Generate unique referral code
    code = f"{user.username.upper()[:3]}{str(user.id)[-3:]}"
    
    # Ensure uniqueness
    while db.query(User).filter(User.referral_code == code).first():
        code = f"{user.username.upper()[:3]}{secrets.randbelow(1000):03d}"
    
    user.referral_code = code
    db.commit()
    
    return code

def calculate_next_milestone(successful_referrals: int) -> int:
    """Calculate the next referral milestone"""
    milestones = [1, 5, 10, 15, 25, 50, 100]
    
    for milestone in milestones:
        if successful_referrals < milestone:
            return milestone
    
    return successful_referrals + 25  # Beyond 100, add 25 each time

def calculate_rank(successful_referrals: int) -> str:
    """Calculate user rank based on successful referrals"""
    if successful_referrals >= 25:
        return "Legend"
    elif successful_referrals >= 10:
        return "Champion"
    elif successful_referrals >= 5:
        return "Ambassador"
    else:
        return "Starter"