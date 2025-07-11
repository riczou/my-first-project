# Frontend Integration Guide

## Overview
This guide explains how to connect your Networking App Backend to a Lovable frontend application.

## Backend Status ✅
Your backend is fully functional and ready for integration:

- **API Server**: Running on `http://localhost:8000`
- **Documentation**: Available at `http://localhost:8000/docs`
- **Authentication**: JWT-based authentication working
- **Database**: SQLite database with all tables created
- **Endpoints**: All core endpoints tested and working

## Integration Options

### Option 1: Direct HTTP Integration (Recommended)
Your frontend will make HTTP requests directly to your backend API.

**Frontend Setup:**
1. Configure your frontend to use the backend API URL
2. Implement authentication flow (register/login)
3. Store JWT tokens securely
4. Make authenticated requests to protected endpoints

**Example Frontend Configuration:**
```javascript
// In your Lovable frontend
const API_BASE_URL = 'http://localhost:8000';
// For production: const API_BASE_URL = 'https://your-backend-domain.com';

// Login function
async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
}

// Authenticated request function
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
```

### Option 2: Git-based Deployment
Deploy your backend and frontend together using Git.

**Steps:**
1. Initialize git repository in your backend folder
2. Push to GitHub/GitLab
3. Connect your Lovable frontend to the same repository
4. Configure deployment settings

## Deployment Strategies

### Development Environment
```bash
# Start the backend locally
cd networking-app-backend
python3 -m uvicorn app.main:app --reload --port 8000

# Your frontend will connect to http://localhost:8000
```

### Production Environment

#### Option A: Cloud Deployment (Recommended)
1. **Backend**: Deploy to Railway, Heroku, or AWS
2. **Frontend**: Deploy through Lovable's deployment system
3. **Database**: Upgrade to PostgreSQL for production

#### Option B: Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build

# Your API will be available at http://localhost:8000
```

## API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

### Platforms
- `GET /platforms/` - Get all platforms
- `POST /platforms/{id}/connect` - Connect to platform
- `DELETE /platforms/{id}/disconnect` - Disconnect platform

### Connections
- `GET /connections/` - Get user connections
- `POST /connections/` - Create new connection
- `PUT /connections/{id}` - Update connection
- `DELETE /connections/{id}` - Delete connection

## CORS Configuration
Your backend is configured to allow requests from:
- `http://localhost:3000` (typical React dev server)
- Any origin (currently set to `*` for development)

For production, update CORS settings in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Environment Variables
Create a `.env` file in your backend folder:
```
APP_NAME=Networking App Backend
DEBUG=False
SECRET_KEY=your-secure-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./networking_app.db
```

## Testing Integration
1. Start your backend: `python3 -m uvicorn app.main:app --reload`
2. Test with curl or Postman
3. Implement frontend authentication flow
4. Test all major user flows

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS settings in `app/main.py`
2. **Authentication Failures**: Check JWT token format and expiration
3. **Database Errors**: Ensure database tables are created
4. **Port Conflicts**: Change port in deployment script

### Debug Mode
Enable debug mode in your `.env` file:
```
DEBUG=True
```

## Next Steps
1. Set up your Lovable frontend to connect to `http://localhost:8000`
2. Implement user authentication flow
3. Build the main application features
4. Deploy both frontend and backend to production

## Support
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
- Database: SQLite file at `./networking_app.db`