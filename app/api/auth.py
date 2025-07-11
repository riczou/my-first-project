from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token, verify_token
from ..core.config import settings
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, Token, UserLogin

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_user(db: Session, user: UserCreate):
    # Check if user already exists
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=UserResponse,
    summary="Register a new user",
    description="""
    Register a new user account with the networking app.
    
    **Required fields:**
    - email: Valid email address (will be used for notifications)
    - username: Unique username (3-50 characters)
    - password: Strong password (minimum 8 characters)
    - first_name: User's first name
    - last_name: User's last name
    
    **Returns:**
    - User profile information (without password)
    - User ID for future API calls
    """,
    responses={
        201: {
            "description": "User successfully registered",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "john.doe@example.com",
                        "username": "johndoe",
                        "first_name": "John",
                        "last_name": "Doe",
                        "is_active": True,
                        "is_verified": False,
                        "created_at": "2023-12-01T10:00:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Username or email already exists",
            "content": {
                "application/json": {
                    "example": {"detail": "Username already registered"}
                }
            }
        }
    }
)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token,
    summary="Login user",
    description="""
    Authenticate a user and return an access token.
    
    **Required fields:**
    - username: Your registered username
    - password: Your account password
    
    **Returns:**
    - access_token: JWT token for API authentication
    - token_type: Always "bearer"
    
    **Usage:**
    Use the returned access_token in the Authorization header:
    `Authorization: Bearer <access_token>`
    """,
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "token_type": "bearer"
                    }
                }
            }
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Incorrect username or password"}
                }
            }
        }
    }
)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse,
    summary="Get current user profile",
    description="""
    Get the profile information of the currently authenticated user.
    
    **Authentication required:** This endpoint requires a valid access token.
    
    **Returns:**
    - Complete user profile information
    - Account status and verification details
    """,
    responses={
        200: {
            "description": "User profile retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "john.doe@example.com",
                        "username": "johndoe",
                        "first_name": "John",
                        "last_name": "Doe",
                        "is_active": True,
                        "is_verified": False,
                        "created_at": "2023-12-01T10:00:00Z",
                        "updated_at": "2023-12-01T10:00:00Z"
                    }
                }
            }
        },
        401: {
            "description": "Authentication required",
            "content": {
                "application/json": {
                    "example": {"detail": "Could not validate credentials"}
                }
            }
        }
    }
)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user