from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .core.security_middleware import limiter, custom_rate_limit_handler
from slowapi.errors import RateLimitExceeded
from .api import auth, users, platforms, connections, companies, resumes, analytics, referrals, payments, admin
from .models import *

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="1.0.0",
    description="""
    ## Networking App Backend API
    
    A comprehensive backend system for a networking app that helps users:
    - Map their professional connections across platforms
    - Discover job opportunities through their network
    - Analyze their network strength and relationships
    - Import and manage connections from LinkedIn, Facebook, and other platforms
    
    ### Features
    - **Authentication**: Secure user registration and login
    - **Platform Integration**: Connect multiple social/professional platforms
    - **Connection Management**: Import, organize, and analyze professional connections
    - **Network Analysis**: Discover mutual connections and network insights
    - **Job Matching**: Find opportunities through your network
    
    ### Getting Started
    1. Register a new account using `/auth/register`
    2. Login to get your access token using `/auth/login`
    3. Connect your platforms using `/platforms/{platform_id}/connect`
    4. Import your connections using `/connections/import`
    5. Explore your network with `/network/overview`
    """,
    contact={
        "name": "Networking App Support",
        "email": "support@networkingapp.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://networking-app-backend-production.up.railway.app",
            "description": "Production server"
        }
    ]
)

# Add security middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

# Add CORS middleware with secure origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
app.include_router(connections.router, prefix="/connections", tags=["connections"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(referrals.router, prefix="/referrals", tags=["referrals"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Networking App Backend API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}