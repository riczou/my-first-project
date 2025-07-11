# GitHub Repository Setup & Lovable Integration

## 📋 Current Status
✅ Git repository initialized  
✅ All files committed  
✅ Ready for remote repository setup  

## 🔗 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)
1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `networking-app-backend`
   - **Description**: `FastAPI backend for networking app with JWT auth, platform integration, and connection management`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Option B: Using GitHub CLI (if available)
```bash
gh repo create networking-app-backend --public --description "FastAPI backend for networking app"
```

## 🔗 Step 2: Connect Local Repository to GitHub

After creating the GitHub repository, run these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/networking-app-backend.git

# Push the code to GitHub
git push -u origin main
```

## 🚀 Step 3: Connect to Lovable

### Option A: Direct Repository Connection
1. In your Lovable project, go to the integration settings
2. Connect your GitHub repository: `YOUR_USERNAME/networking-app-backend`
3. Set the backend API URL to point to your deployed backend

### Option B: Environment Variable Configuration
In your Lovable frontend, set these environment variables:
```
REACT_APP_API_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
```

For production:
```
REACT_APP_API_URL=https://your-backend-domain.com
VITE_API_URL=https://your-backend-domain.com
```

## 🏗️ Step 4: Deploy Backend

### Railway (Recommended for beginners)
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `networking-app-backend` repository
6. Railway will automatically deploy your FastAPI app
7. Set environment variables in Railway dashboard:
   - `SECRET_KEY`: Generate a secure random string
   - `DEBUG`: `False`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`

### Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set config vars:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   ```
5. Deploy: `git push heroku main`

### Render
1. Go to [Render.com](https://render.com)
2. Connect your GitHub repository
3. Choose "Web Service"
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 🔧 Step 5: Configure Frontend

In your Lovable frontend, create an API client:

```javascript
// api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return response.json();
  },

  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.access_token) {
      localStorage.setItem('accessToken', response.access_token);
    }
    
    return response;
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getCurrentUser() {
    return this.request('/auth/me');
  },

  async getConnections() {
    return this.request('/connections/');
  },

  async createConnection(connectionData) {
    return this.request('/connections/', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  },
};
```

## 🎯 Step 6: Test Integration

1. Start your backend locally: `uvicorn app.main:app --reload`
2. Test the API endpoints: `http://localhost:8000/docs`
3. Configure your frontend to use the backend API
4. Test the full authentication flow
5. Deploy both frontend and backend

## 🔍 Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS settings in `app/main.py`
2. **Environment variables**: Ensure all required env vars are set
3. **Database issues**: Check database file permissions
4. **Authentication errors**: Verify JWT secret key configuration

### Debug Steps:
1. Check backend logs
2. Test API endpoints directly
3. Verify environment variables
4. Check network connectivity
5. Review CORS configuration

## 📞 Support

- **Backend API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`

## 🔄 Next Steps

1. Create GitHub repository
2. Push code to GitHub
3. Deploy backend to Railway/Heroku
4. Configure Lovable frontend
5. Test full integration
6. Deploy to production

Your networking app backend is fully ready for integration! 🚀