// API Service for ClickTales Frontend
// This replaces your existing services/supabase.ts with a real backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types to match your existing frontend types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  avatar?: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  capturedAt: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Token management
class TokenManager {
  private static TOKEN_KEY = 'clicktales_token';
  private static REFRESH_TOKEN_KEY = 'clicktales_refresh_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Base API client with error handling and token refresh
class APIClient {
  private static async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...TokenManager.getAuthHeaders(),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.message?.includes('expired')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              ...TokenManager.getAuthHeaders(),
            },
          };
          const retryResponse = await fetch(`${API_BASE_URL}${url}`, retryConfig);
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          TokenManager.clearTokens();
          window.location.href = '/login';
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (data.success && data.data?.token) {
        TokenManager.setToken(data.data.token);
        if (data.data.refreshToken) {
          TokenManager.setRefreshToken(data.data.refreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  static get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url);
  }

  static post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  static upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: formData,
      headers: TokenManager.getAuthHeaders(), // Don't set Content-Type for FormData
    });
  }
}

// Authentication API
export const authAPI = {
  async register(userData: {
    email: string;
    username: string;
    name: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await APIClient.post<{
      user: User;
      token: string;
      refreshToken?: string;
    }>('/auth/register', userData);
    
    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        TokenManager.setRefreshToken(response.data.refreshToken);
      }
    }
    return response as AuthResponse;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await APIClient.post<{
      user: User;
      token: string;
      refreshToken?: string;
    }>('/auth/login', { email, password });
    
    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        TokenManager.setRefreshToken(response.data.refreshToken);
      }
    }
    return response as AuthResponse;
  },

  async logout(): Promise<ApiResponse> {
    const response = await APIClient.post('/auth/logout');
    TokenManager.clearTokens();
    return response;
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return APIClient.get('/auth/profile');
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return APIClient.put('/auth/profile', userData);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return APIClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  getCurrentUser(): User | null {
    const token = TokenManager.getToken();
    if (!token) return null;
    
    try {
      // Decode JWT token to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id,
        email: payload.email,
        username: payload.username,
        name: payload.name || payload.username,
        role: payload.role || 'USER',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!TokenManager.getToken();
  },
};

// Photos API
export const photoAPI = {
  async getPhotos(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<PaginatedResponse<Photo>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = searchParams.toString();
    return APIClient.get(`/photos${queryString ? `?${queryString}` : ''}`);
  },

  async getPhotoById(id: string): Promise<ApiResponse<{ photo: Photo }>> {
    return APIClient.get(`/photos/${id}`);
  },

  async getUserPhotos(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Photo>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return APIClient.get(`/photos/user/me${queryString ? `?${queryString}` : ''}`);
  },

  async uploadPhoto(
    file: File,
    metadata?: {
      tags?: string[];
      location?: string;
      device?: string;
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<{ photo: Photo }>> {
    const formData = new FormData();
    formData.append('photo', file);
    
    if (metadata) {
      if (metadata.tags) {
        metadata.tags.forEach(tag => formData.append('tags', tag));
      }
      if (metadata.location) formData.append('location', metadata.location);
      if (metadata.device) formData.append('device', metadata.device);
      if (metadata.isPublic !== undefined) {
        formData.append('isPublic', metadata.isPublic.toString());
      }
    }

    return APIClient.upload('/photos', formData);
  },

  async updatePhoto(
    id: string,
    updates: {
      tags?: string[];
      isPublic?: boolean;
      isFeatured?: boolean;
    }
  ): Promise<ApiResponse<{ photo: Photo }>> {
    return APIClient.put(`/photos/${id}`, updates);
  },

  async deletePhoto(id: string): Promise<ApiResponse> {
    return APIClient.delete(`/photos/${id}`);
  },
};

// Export token manager for use in contexts
export { TokenManager };

// Default export with all APIs
export default {
  auth: authAPI,
  photos: photoAPI,
};