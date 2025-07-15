from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Networking App Backend"
    debug: bool = True
    database_url: str = "sqlite:///./networking_app.db"
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Optional fields that may be in .env
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[str] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    frontend_url: Optional[str] = None
    environment: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without validation errors


settings = Settings()