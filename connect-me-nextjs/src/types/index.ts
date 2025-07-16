export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connection {
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

export interface Platform {
  id: number;
  name: string;
  base_url: string;
  is_active: boolean;
  scraping_enabled: boolean;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  content_text: string;
  skills_extracted: string[];
  experience_years?: number;
  education_level?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  connectionsCount: number;
  companiesCount: number;
  resumesCount: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}