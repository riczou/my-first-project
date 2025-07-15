from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import Platform, User
from app.core.database import Base
from app.core.security import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

def seed_platforms():
    """Seed the database with initial platform data"""
    db: Session = SessionLocal()
    
    # Check if platforms already exist
    if db.query(Platform).first():
        print("Platforms already exist in database")
        db.close()
        return
    
    # Create initial platforms
    platforms = [
        Platform(
            name="LinkedIn",
            base_url="https://www.linkedin.com",
            is_active=True,
            scraping_enabled=True
        ),
        Platform(
            name="Facebook",
            base_url="https://www.facebook.com",
            is_active=True,
            scraping_enabled=False
        ),
        Platform(
            name="Twitter",
            base_url="https://www.twitter.com",
            is_active=True,
            scraping_enabled=False
        ),
        Platform(
            name="Instagram",
            base_url="https://www.instagram.com",
            is_active=True,
            scraping_enabled=False
        )
    ]
    
    for platform in platforms:
        db.add(platform)
    
    db.commit()
    print(f"Created {len(platforms)} platforms")
    db.close()

def seed_admin_user():
    """Create an admin user for dashboard access"""
    db: Session = SessionLocal()
    
    # Check if admin already exists
    admin_user = db.query(User).filter(User.is_admin == True).first()
    if admin_user:
        print("Admin user already exists")
        db.close()
        return
    
    # Create admin user
    admin = User(
        email="admin@networkingapp.com",
        username="admin",
        first_name="Admin",
        last_name="User",
        password_hash=get_password_hash("admin123"),
        is_admin=True,
        is_active=True,
        is_verified=True
    )
    
    db.add(admin)
    db.commit()
    print("Created admin user (username: admin, password: admin123)")
    db.close()

if __name__ == "__main__":
    print("Seeding database with initial data...")
    seed_platforms()
    seed_admin_user()
    print("Database seeding completed!")