import { getSession } from 'next-auth/react';

interface ApiClientOptions {
  showErrorToast?: boolean;
  retryOnAuthError?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.access;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    clientOptions: ApiClientOptions = {}
  ): Promise<Response> {
    const { showErrorToast = true, retryOnAuthError = true } = clientOptions;
    
    try {
      const headers = await this.getAuthHeaders();
      const session = await getSession();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401 && retryOnAuthError && session?.refreshToken) {
        // Try to refresh the token
        const newAccessToken = await this.refreshToken(session.refreshToken);
        
        if (newAccessToken) {
          // Retry the request with the new token
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`,
              ...options.headers,
            },
          });
          
          if (retryResponse.ok) {
            return retryResponse;
          }
        }
        
        // If refresh failed, throw error to trigger logout
        throw new Error('Session expired. Please log in again.');
      }

      return response;
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (showErrorToast) {
        // You can integrate with your toast system here
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  }

  async get(endpoint: string, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { method: 'GET' }, options);
  }

  async post(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options);
  }

  async put(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options);
  }

  async patch(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, options);
  }

  async delete(endpoint: string, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { method: 'DELETE' }, options);
  }

  async upload(endpoint: string, formData: FormData, options: ApiClientOptions = {}): Promise<Response> {
    const session = await getSession();
    const headers: HeadersInit = {};

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    }, options);
  }
}

export const apiClient = new ApiClient();
