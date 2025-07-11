# Frontend Integration Guide

## 🎯 **Quick Start**

Your backend is live at: **https://networking-app-backend-production.up.railway.app**

## 📁 **Files to Copy to Your Lovable Project**

1. **`apiClient.js`** - Main API client for communicating with your backend
2. **`LoginForm.jsx`** - Login form component
3. **`RegisterForm.jsx`** - User registration form
4. **`Dashboard.jsx`** - Main dashboard after login
5. **`App.jsx`** - Main app component that ties everything together

## 🔧 **Setup Instructions**

### **Step 1: Copy Files to Lovable**
1. Copy all the `.jsx` and `.js` files to your Lovable project
2. Place them in your `src/components/` folder or similar

### **Step 2: Configure API URL**
In `apiClient.js`, the API URL is already set to your live backend:
```javascript
const API_BASE_URL = 'https://networking-app-backend-production.up.railway.app';
```

### **Step 3: Use the Components**
Replace your main App component with the provided `App.jsx` or integrate the components into your existing structure.

## 🚀 **What Each Component Does**

### **apiClient.js**
- **Complete API client** with all backend endpoints
- **Handles authentication** (stores JWT tokens)
- **Error handling** and request management
- **Ready to use** - just import and call methods

### **LoginForm.jsx**
- **User login form** with username and password
- **Handles authentication** and stores tokens
- **Error handling** for invalid credentials
- **Switches to registration** if needed

### **RegisterForm.jsx**
- **User registration form** with all required fields
- **Password confirmation** and validation
- **Creates new user accounts** via your backend
- **Professional form validation**

### **Dashboard.jsx**
- **Main user dashboard** after login
- **Shows user statistics** (connection count, etc.)
- **Platform connection** interface
- **Connection management** (view/delete connections)
- **Logout functionality**

### **App.jsx**
- **Main app component** that manages routing
- **Handles authentication state**
- **Switches between login/register/dashboard**
- **Checks for existing authentication** on app load

## 🎯 **Usage Examples**

### **Test the API Connection**
```javascript
import apiClient from './apiClient';

// Test if backend is reachable
const testConnection = async () => {
  const isConnected = await apiClient.testConnection();
  console.log('Backend connected:', isConnected);
};
```

### **Register a New User**
```javascript
const registerUser = async () => {
  try {
    const user = await apiClient.register({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    });
    console.log('Registration successful:', user);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

### **Login User**
```javascript
const loginUser = async () => {
  try {
    const response = await apiClient.login('testuser', 'password123');
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### **Get User Connections**
```javascript
const loadConnections = async () => {
  try {
    const connections = await apiClient.getConnections();
    console.log('User connections:', connections);
  } catch (error) {
    console.error('Failed to load connections:', error.message);
  }
};
```

## 🔒 **Authentication Flow**

1. **User registers** using RegisterForm
2. **User logs in** using LoginForm
3. **JWT token stored** in localStorage
4. **All API calls** automatically include the token
5. **User sees Dashboard** with their data
6. **Token persists** across browser sessions

## 🛠️ **Customization**

### **Styling**
- All components use inline styles for simplicity
- **Replace with your CSS classes** or styled-components
- **Customize colors, fonts, layouts** to match your design

### **Add Features**
- **Connection creation form** - Add new connections
- **Platform management** - More platform integration
- **Profile editing** - Update user information
- **Advanced filtering** - Search and filter connections

### **Error Handling**
- **Network errors** are caught and displayed
- **Authentication errors** redirect to login
- **Validation errors** show user-friendly messages

## 🧪 **Testing Your Integration**

### **1. Test API Connection**
```javascript
// In your browser console
import apiClient from './apiClient';
apiClient.testConnection().then(console.log);
```

### **2. Test Registration**
1. Use the RegisterForm to create a test account
2. Check if the user appears in your backend
3. Verify the user can login after registration

### **3. Test Login**
1. Use the LoginForm with your test credentials
2. Check if the JWT token is stored in localStorage
3. Verify the Dashboard loads with user data

### **4. Test Backend Endpoints**
Visit your backend documentation to test endpoints:
**https://networking-app-backend-production.up.railway.app/docs**

## 🔍 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Your backend is configured to allow frontend connections
   - If you see CORS errors, check your Lovable domain settings

2. **Network Errors**
   - Check if your backend is running: https://networking-app-backend-production.up.railway.app/health
   - Verify the API_BASE_URL in apiClient.js

3. **Authentication Issues**
   - Check browser localStorage for 'accessToken'
   - Verify JWT token format in Network tab
   - Check if token is expired

4. **Component Errors**
   - Ensure all imports are correct
   - Check React version compatibility
   - Verify component file paths

### **Debug Steps**
1. **Check browser Network tab** for API calls
2. **Check browser Console** for JavaScript errors
3. **Test individual API endpoints** in backend docs
4. **Verify authentication tokens** in localStorage

## 📞 **Support**

### **Your Backend Resources**
- **API Documentation**: https://networking-app-backend-production.up.railway.app/docs
- **Health Check**: https://networking-app-backend-production.up.railway.app/health
- **Backend Source**: https://github.com/riczou/networking-app-backend

### **Next Steps**
1. **Copy the components** to your Lovable project
2. **Test the authentication flow** (register → login → dashboard)
3. **Customize the styling** to match your design
4. **Add more features** as needed
5. **Deploy your frontend** and connect to the live backend

Your backend is **production-ready** and **fully functional**! The frontend components are **complete** and **ready to use**. You now have a full-stack networking application! 🎉