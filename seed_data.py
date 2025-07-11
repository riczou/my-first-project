from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import Platform
from app.core.database import Base

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

if __name__ == "__main__":
    print("Seeding database with initial data...")
    seed_platforms()
    print("Database seeding completed!")