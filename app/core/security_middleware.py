from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
import logging

# Configure rate limiter
limiter = Limiter(key_func=get_remote_address)

# Custom rate limit exceeded handler
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors."""
    logging.warning(f"Rate limit exceeded for {get_remote_address(request)}: {exc}")
    
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Limit: {exc.detail}",
            "retry_after": getattr(exc, 'retry_after', None)
        }
    )

# Input validation helpers
def validate_string_input(value: str, max_length: int = 255, min_length: int = 1) -> str:
    """Validate and sanitize string input."""
    if not isinstance(value, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input type. Expected string."
        )
    
    # Strip whitespace and check length
    value = value.strip()
    if len(value) < min_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input too short. Minimum length: {min_length}"
        )
    
    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input too long. Maximum length: {max_length}"
        )
    
    return value

def validate_email(email: str) -> str:
    """Validate email format."""
    import re
    
    email = validate_string_input(email, max_length=254)
    
    # Basic email regex validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    return email.lower()

def validate_username(username: str) -> str:
    """Validate username format."""
    import re
    
    username = validate_string_input(username, max_length=50, min_length=3)
    
    # Username can only contain alphanumeric characters and underscores
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username can only contain letters, numbers, and underscores"
        )
    
    return username.lower()