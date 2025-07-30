from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Networking App Backend"
    debug: bool = Field(default=False, env="DEBUG")
    database_url: str = Field(default="sqlite:///./networking_app.db", env="DATABASE_URL")
    secret_key: str = Field(env="SECRET_KEY", description="JWT secret key - MUST be set in environment variables")
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
    frontend_url: str = Field(default="http://localhost:3002", env="FRONTEND_URL")
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:3001,http://localhost:3002", env="ALLOWED_ORIGINS")
    
    def get_allowed_origins(self) -> list:
        """Convert comma-separated ALLOWED_ORIGINS string to list"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without validation errors


settings = Settings()