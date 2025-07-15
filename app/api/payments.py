from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..core.database import get_db
from ..core.security import get_current_user
from ..models import User, Subscription, PaymentHistory
from datetime import datetime, timedelta
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter()

class CreateSubscriptionRequest(BaseModel):
    plan: str  # free, professional, executive, enterprise
    billing_cycle: str  # monthly, yearly
    payment_method_id: str

class UpdateSubscriptionRequest(BaseModel):
    plan: str
    billing_cycle: str

class PaymentIntentRequest(BaseModel):
    plan: str
    billing_cycle: str

@router.get("/plans")
async def get_pricing_plans():
    """Get available pricing plans"""
    
    plans = {
        "free": {
            "name": "Free",
            "price": 0,
            "features": [
                "Basic network analysis",
                "Up to 50 connections",
                "Monthly insights report",
                "Community support"
            ],
            "limits": {
                "connections": 50,
                "analytics": "basic",
                "support": "community"
            }
        },
        "professional": {
            "name": "Professional",
            "monthly_price": 29,
            "yearly_price": 290,  # 17% discount
            "features": [
                "Advanced network analytics",
                "Unlimited connections",
                "Weekly insights reports", 
                "Job opportunity alerts",
                "Email support",
                "Export capabilities"
            ],
            "limits": {
                "connections": "unlimited",
                "analytics": "advanced",
                "support": "email"
            }
        },
        "executive": {
            "name": "Executive",
            "monthly_price": 79,
            "yearly_price": 790,  # 17% discount
            "features": [
                "Premium network analytics",
                "Unlimited connections",
                "Daily insights reports",
                "Priority job matching",
                "Phone + email support",
                "Custom integrations",
                "Referral rewards",
                "Network health scoring"
            ],
            "limits": {
                "connections": "unlimited",
                "analytics": "premium",
                "support": "priority"
            }
        },
        "enterprise": {
            "name": "Enterprise",
            "price": "Custom",
            "features": [
                "White-label solution",
                "Custom analytics dashboard",
                "API access",
                "Dedicated account manager",
                "Custom integrations",
                "SSO support",
                "Advanced security",
                "Training & onboarding"
            ],
            "limits": {
                "connections": "unlimited",
                "analytics": "enterprise",
                "support": "dedicated"
            }
        }
    }
    
    return {"plans": plans}

@router.post("/create-payment-intent")
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe payment intent for subscription"""
    
    # Calculate amount based on plan and billing cycle
    amount = calculate_subscription_amount(request.plan, request.billing_cycle)
    
    if amount == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create payment intent for free plan"
        )
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe uses cents
            currency='usd',
            customer=get_or_create_stripe_customer(current_user),
            metadata={
                'user_id': current_user.id,
                'plan': request.plan,
                'billing_cycle': request.billing_cycle
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "amount": amount,
            "currency": "usd"
        }
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment intent creation failed: {str(e)}"
        )

@router.post("/subscribe")
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    
    # Check if user already has an active subscription
    existing_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )
    
    # Calculate subscription details
    amount = calculate_subscription_amount(request.plan, request.billing_cycle)
    duration_days = 30 if request.billing_cycle == "monthly" else 365
    
    try:
        # Create Stripe subscription
        customer_id = get_or_create_stripe_customer(current_user)
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            request.payment_method_id,
            customer=customer_id
        )
        
        # Create subscription in Stripe
        stripe_subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'ConnectMe {request.plan.title()} Plan'
                    },
                    'unit_amount': int(amount * 100),
                    'recurring': {
                        'interval': 'month' if request.billing_cycle == 'monthly' else 'year'
                    }
                }
            }],
            default_payment_method=request.payment_method_id,
            metadata={
                'user_id': current_user.id,
                'plan': request.plan
            }
        )
        
        # Create subscription record in database
        subscription = Subscription(
            user_id=current_user.id,
            plan_name=request.plan,
            billing_cycle=request.billing_cycle,
            price=amount,
            status="active",
            starts_at=datetime.utcnow(),
            ends_at=datetime.utcnow() + timedelta(days=duration_days),
            payment_id=stripe_subscription.id
        )
        
        db.add(subscription)
        
        # Update user subscription info
        current_user.subscription_tier = request.plan
        current_user.subscription_status = "active"
        
        # Create payment history record
        payment = PaymentHistory(
            user_id=current_user.id,
            subscription_id=subscription.id,
            amount=amount,
            currency="USD",
            payment_method="card",
            stripe_payment_id=stripe_subscription.latest_invoice,
            status="succeeded",
            description=f"{request.plan.title()} plan subscription"
        )
        
        db.add(payment)
        db.commit()
        
        return {
            "message": "Subscription created successfully",
            "subscription_id": subscription.id,
            "plan": request.plan,
            "amount": amount,
            "billing_cycle": request.billing_cycle
        }
    
    except stripe.error.StripeError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subscription creation failed: {str(e)}"
        )

@router.put("/subscription")
async def update_subscription(
    request: UpdateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update existing subscription"""
    
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    # Calculate new amount
    new_amount = calculate_subscription_amount(request.plan, request.billing_cycle)
    
    try:
        # Update Stripe subscription
        stripe.Subscription.modify(
            subscription.payment_id,
            items=[{
                'id': stripe.Subscription.retrieve(subscription.payment_id).items.data[0].id,
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'ConnectMe {request.plan.title()} Plan'
                    },
                    'unit_amount': int(new_amount * 100),
                    'recurring': {
                        'interval': 'month' if request.billing_cycle == 'monthly' else 'year'
                    }
                }
            }]
        )
        
        # Update database record
        subscription.plan_name = request.plan
        subscription.billing_cycle = request.billing_cycle
        subscription.price = new_amount
        
        current_user.subscription_tier = request.plan
        
        db.commit()
        
        return {
            "message": "Subscription updated successfully",
            "plan": request.plan,
            "billing_cycle": request.billing_cycle,
            "amount": new_amount
        }
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subscription update failed: {str(e)}"
        )

@router.delete("/subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel current subscription"""
    
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    try:
        # Cancel Stripe subscription
        stripe.Subscription.delete(subscription.payment_id)
        
        # Update database record
        subscription.status = "cancelled"
        subscription.cancelled_at = datetime.utcnow()
        
        current_user.subscription_status = "cancelled"
        
        db.commit()
        
        return {"message": "Subscription cancelled successfully"}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subscription cancellation failed: {str(e)}"
        )

@router.get("/subscription")
async def get_subscription_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current subscription information"""
    
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status.in_(["active", "cancelled"])
    ).order_by(Subscription.created_at.desc()).first()
    
    if not subscription:
        return {
            "plan": "free",
            "status": "active",
            "billing_cycle": None,
            "amount": 0,
            "starts_at": None,
            "ends_at": None
        }
    
    return {
        "plan": subscription.plan_name,
        "status": subscription.status,
        "billing_cycle": subscription.billing_cycle,
        "amount": subscription.price,
        "starts_at": subscription.starts_at.isoformat(),
        "ends_at": subscription.ends_at.isoformat(),
        "cancelled_at": subscription.cancelled_at.isoformat() if subscription.cancelled_at else None
    }

@router.get("/payment-history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment history for the current user"""
    
    payments = db.query(PaymentHistory).filter(
        PaymentHistory.user_id == current_user.id
    ).order_by(PaymentHistory.created_at.desc()).all()
    
    return {
        "payments": [
            {
                "id": payment.id,
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status,
                "description": payment.description,
                "created_at": payment.created_at.isoformat()
            }
            for payment in payments
        ]
    }

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'], db)
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'], db)
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_cancelled(event['data']['object'], db)
    
    return {"received": True}

def calculate_subscription_amount(plan: str, billing_cycle: str) -> float:
    """Calculate subscription amount based on plan and billing cycle"""
    
    prices = {
        "free": {"monthly": 0, "yearly": 0},
        "professional": {"monthly": 29, "yearly": 290},
        "executive": {"monthly": 79, "yearly": 790},
        "enterprise": {"monthly": 199, "yearly": 1990}
    }
    
    return prices.get(plan, {}).get(billing_cycle, 0)

def get_or_create_stripe_customer(user: User) -> str:
    """Get existing Stripe customer ID or create new customer"""
    
    # In a real implementation, you'd store the customer ID in the user record
    # For now, we'll create a new customer each time
    customer = stripe.Customer.create(
        email=user.email,
        name=f"{user.first_name} {user.last_name}",
        metadata={'user_id': user.id}
    )
    
    return customer.id

def handle_payment_succeeded(invoice, db: Session):
    """Handle successful payment webhook"""
    
    # Extract user_id from customer metadata
    customer = stripe.Customer.retrieve(invoice['customer'])
    user_id = customer.metadata.get('user_id')
    
    if user_id:
        # Update subscription status
        subscription = db.query(Subscription).filter(
            Subscription.user_id == int(user_id),
            Subscription.status == "active"
        ).first()
        
        if subscription:
            # Extend subscription period
            if subscription.billing_cycle == "monthly":
                subscription.ends_at = subscription.ends_at + timedelta(days=30)
            else:
                subscription.ends_at = subscription.ends_at + timedelta(days=365)
            
            db.commit()

def handle_payment_failed(invoice, db: Session):
    """Handle failed payment webhook"""
    
    customer = stripe.Customer.retrieve(invoice['customer'])
    user_id = customer.metadata.get('user_id')
    
    if user_id:
        # Update subscription status or send notification
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            # In a real implementation, send payment failed email
            pass

def handle_subscription_cancelled(subscription, db: Session):
    """Handle subscription cancellation webhook"""
    
    customer = stripe.Customer.retrieve(subscription['customer'])
    user_id = customer.metadata.get('user_id')
    
    if user_id:
        # Update subscription status
        db_subscription = db.query(Subscription).filter(
            Subscription.user_id == int(user_id),
            Subscription.payment_id == subscription['id']
        ).first()
        
        if db_subscription:
            db_subscription.status = "cancelled"
            db_subscription.cancelled_at = datetime.utcnow()
            
            # Downgrade user to free plan
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.subscription_tier = "free"
                user.subscription_status = "cancelled"
            
            db.commit()