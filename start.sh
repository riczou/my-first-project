#!/bin/bash
# Railway startup script to handle PORT variable properly

# Set default port if PORT environment variable is not set
export PORT=${PORT:-8000}

echo "Starting server on port: $PORT"

# Start uvicorn with the correct port
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT