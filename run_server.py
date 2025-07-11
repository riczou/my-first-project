#!/usr/bin/env python3
"""
Startup script for the Networking App Backend
"""

import uvicorn
import os
import sys

def main():
    """Run the FastAPI application"""
    print("🚀 Starting Networking App Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("─" * 50)
    
    # Change to the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()