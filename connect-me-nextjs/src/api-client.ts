interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

interface Connection {
  id: number;
  user_id: number;
  platform_id: number;
  connection_name: string;
  connection_profile_url?: string;
  connection_title?: string;
  connection_company?: string;
  connection_location?: string;
  relationship_strength?: number;
  mutual_connections_count?: number;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseURL = baseURL;
    
    // Check for token in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || `HTTP ${response.status}: ${response.statusText}` };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Network error occurred' };
    }
  }


  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ access_token: string; token_type: string }>> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      this.setToken(data.access_token);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    const result = await this.post<User>('/auth/register', userData);
    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/me');
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.clearToken();
  }

  // Connection methods
  async getConnections(): Promise<ApiResponse<Connection[]>> {
    return this.get<Connection[]>('/connections');
  }

  async createConnection(connectionData: Partial<Connection>): Promise<ApiResponse<Connection>> {
    return this.post<Connection>('/connections', connectionData);
  }

  async updateConnection(id: number, connectionData: Partial<Connection>): Promise<ApiResponse<Connection>> {
    return this.put<Connection>(`/connections/${id}`, connectionData);
  }

  async deleteConnection(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/connections/${id}`);
  }

  // Company methods
  async getCompanyAnalytics(): Promise<ApiResponse<any>> {
    return this.get('/companies/analytics');
  }

  // Resume methods
  async getResumes(): Promise<ApiResponse<any[]>> {
    return this.get('/resumes');
  }

  // Platform methods
  async getPlatforms(): Promise<ApiResponse<any[]>> {
    return this.get('/platforms');
  }

  // Admin methods for dashboard
  async getAdminDashboardOverview(): Promise<ApiResponse<any>> {
    return this.get('/admin/dashboard/overview');
  }

  async getAdminUserAnalytics(days: number = 30): Promise<ApiResponse<any>> {
    return this.get(`/admin/users/analytics?days=${days}`);
  }

  async getAdminUsersList(page: number = 1, limit: number = 50, search?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    if (search) params.append('search', search);
    return this.get(`/admin/users/list?${params}`);
  }

  // CSV Export method
  async exportUsersCSV(search?: string, subscription_tier?: string, is_active?: boolean): Promise<void> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (subscription_tier) params.append('subscription_tier', subscription_tier);
    if (is_active !== undefined) params.append('is_active', is_active.toString());

    const url = `${this.baseURL}/admin/users/export/csv?${params}`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'users_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;

// Export types
export type { User, Connection, LoginCredentials, RegisterData, ApiResponse };