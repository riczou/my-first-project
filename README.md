# Networking App Backend

A FastAPI-based backend for a professional networking application that helps users map connections and discover job opportunities.

## 🚀 Features

- **User Authentication** - JWT-based secure authentication
- **Platform Integration** - Connect LinkedIn, Facebook, Twitter, Instagram
- **Connection Management** - Import, organize, and analyze professional connections
- **Network Analysis** - Discover mutual connections and network insights
- **Job Matching** - Find opportunities through your network
- **RESTful API** - Well-documented API with Swagger UI

## 🛠️ Tech Stack

- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (easily upgradeable to PostgreSQL)
- **JWT** - Authentication tokens
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📦 Installation

### Prerequisites
- Python 3.11 or higher
- pip package manager

### Setup
1. Clone the repository
```bash
git clone <repository-url>
cd networking-app-backend
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize database
```bash
python seed_data.py
```

## 🚀 Running the Application

### Development
```bash
uvicorn app.main:app --reload
```

### Production
```bash
python deploy.py
```

### Docker
```bash
docker-compose up --build
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔗 API Endpoints

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

## 🧪 Testing

Run the test suite:
```bash
pytest
```

## 🔧 Configuration

Key environment variables:
- `SECRET_KEY` - JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
- `DATABASE_URL` - Database connection string
- `DEBUG` - Debug mode (True/False)

## 🚢 Deployment

### Railway
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Heroku
1. Create Heroku app
2. Set config vars
3. Deploy using Git

### Docker
Use the provided Dockerfile and docker-compose.yml

## 🔐 Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy

## 🤝 Integration

### Frontend Integration
See `INTEGRATION_GUIDE.md` for detailed frontend integration instructions.

### Example API Usage
```javascript
// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});

// Authenticated request
const connections = await fetch('/connections/', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📁 Project Structure

```
networking-app-backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core functionality
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── main.py       # FastAPI app
├── tests/            # Test files
├── requirements.txt  # Dependencies
├── Dockerfile        # Docker configuration
├── docker-compose.yml
└── README.md
```

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Change port in uvicorn command
2. **Database errors**: Check database file permissions
3. **JWT errors**: Verify SECRET_KEY configuration
4. **CORS errors**: Update CORS settings in main.py

### Debug Mode
Set `DEBUG=True` in .env file for detailed error messages.

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Check the API documentation at `/docs`
- Review the integration guide
- Check application health at `/health`

## 🔄 Development Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

## 🎯 Roadmap

- [ ] PostgreSQL support
- [ ] Advanced network analysis
- [ ] Real-time notifications
- [ ] Machine learning recommendations
- [ ] Mobile app support
- [ ] Advanced security features

---

**Happy Networking!** 🌐