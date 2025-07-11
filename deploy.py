#!/usr/bin/env python3
"""
Production deployment script for Networking App Backend
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed")
        print(f"Error: {e.stderr}")
        return False

def check_requirements():
    """Check if all requirements are met"""
    print("Checking requirements...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("Warning: .env file not found. Please copy .env.example to .env and configure it.")
        return False
    
    # Check if requirements.txt exists
    if not os.path.exists('requirements.txt'):
        print("Error: requirements.txt not found")
        return False
    
    print("✓ All requirements check passed")
    return True

def setup_production():
    """Set up production environment"""
    print("Setting up production environment...")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Create database tables
    if not run_command("python -c \"from app.main import app; from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)\"", "Creating database tables"):
        return False
    
    # Seed initial data if needed
    if os.path.exists('seed_data.py'):
        run_command("python seed_data.py", "Seeding initial data")
    
    print("✓ Production setup completed")
    return True

def start_server():
    """Start the production server"""
    print("Starting production server...")
    
    # Get configuration from environment
    host = os.getenv('HOST', '0.0.0.0')
    port = os.getenv('PORT', '8000')
    
    command = f"uvicorn app.main:app --host {host} --port {port} --workers 4"
    
    print(f"Starting server with command: {command}")
    print(f"Server will be available at: http://{host}:{port}")
    print("API documentation will be available at: http://{host}:{port}/docs")
    
    try:
        subprocess.run(command, shell=True, check=True)
    except KeyboardInterrupt:
        print("\n✓ Server stopped")

def main():
    """Main deployment function"""
    print("🚀 Networking App Backend Deployment Script")
    print("=" * 50)
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Setup production environment
    if not setup_production():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()