/**
 * API Client for Networking App Frontend
 * Use this in your Lovable project to connect to your backend
 */

// Your backend URL
const API_BASE_URL = 'https://networking-app-backend-production.up.railway.app';

// Alternative for environment variables
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://networking-app-backend-production.up.railway.app';

class NetworkingApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Update token in localStorage and class instance
  setToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  // Remove token
  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // ========== AUTHENTICATION ENDPOINTS ==========

  // Register new user
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  // Login user
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  // Logout user
  logout() {
    this.clearToken();
  }

  // Get current user profile
  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // ========== PLATFORM ENDPOINTS ==========

  // Get all available platforms
  async getPlatforms() {
    return await this.request('/platforms/');
  }

  // Get specific platform
  async getPlatform(platformId) {
    return await this.request(`/platforms/${platformId}`);
  }

  // Connect to a platform
  async connectPlatform(platformId, accountData) {
    return await this.request(`/platforms/${platformId}/connect`, {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  // Disconnect from a platform
  async disconnectPlatform(platformId) {
    return await this.request(`/platforms/${platformId}/disconnect`, {
      method: 'DELETE',
    });
  }

  // Get platform connection status
  async getPlatformStatus(platformId) {
    return await this.request(`/platforms/${platformId}/status`);
  }

  // ========== CONNECTION ENDPOINTS ==========

  // Get all user connections
  async getConnections() {
    return await this.request('/connections/');
  }

  // Get specific connection
  async getConnection(connectionId) {
    return await this.request(`/connections/${connectionId}`);
  }

  // Create new connection
  async createConnection(connectionData) {
    return await this.request('/connections/', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  // Update connection
  async updateConnection(connectionId, connectionData) {
    return await this.request(`/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(connectionData),
    });
  }

  // Delete connection
  async deleteConnection(connectionId) {
    return await this.request(`/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  // ========== USER MANAGEMENT ENDPOINTS ==========

  // Get current user details
  async getMe() {
    return await this.request('/users/me');
  }

  // Update current user
  async updateMe(userData) {
    return await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Get user by ID
  async getUser(userId) {
    return await this.request(`/users/${userId}`);
  }

  // ========== UTILITY METHODS ==========

  // Test API connection
  async testConnection() {
    try {
      const response = await this.request('/health');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  // Get API info
  async getApiInfo() {
    return await this.request('/');
  }
}

// Create and export a singleton instance
const apiClient = new NetworkingApiClient();
export default apiClient;

// Export the class for custom instances
export { NetworkingApiClient };

// ========== USAGE EXAMPLES ==========

/*
// In your Lovable components:

import apiClient from './apiClient';

// Register a new user
const registerUser = async (formData) => {
  try {
    const user = await apiClient.register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
    });
    console.log('User registered:', user);
    return user;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};

// Login user
const loginUser = async (username, password) => {
  try {
    const response = await apiClient.login(username, password);
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Get user's connections
const loadConnections = async () => {
  try {
    const connections = await apiClient.getConnections();
    console.log('User connections:', connections);
    return connections;
  } catch (error) {
    console.error('Failed to load connections:', error.message);
    throw error;
  }
};

// Create a new connection
const addConnection = async (connectionData) => {
  try {
    const connection = await apiClient.createConnection({
      connection_name: connectionData.name,
      platform_id: connectionData.platformId,
      connection_title: connectionData.title,
      connection_company: connectionData.company,
      relationship_strength: connectionData.strength,
    });
    console.log('Connection created:', connection);
    return connection;
  } catch (error) {
    console.error('Failed to create connection:', error.message);
    throw error;
  }
};

// Check authentication status
const checkAuth = () => {
  if (apiClient.isAuthenticated()) {
    console.log('User is authenticated');
  } else {
    console.log('User is not authenticated');
  }
};

*/