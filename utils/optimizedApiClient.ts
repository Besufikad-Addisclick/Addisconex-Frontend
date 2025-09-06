import { getSession } from 'next-auth/react';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface ApiClientOptions {
  showErrorToast?: boolean;
  retryOnAuthError?: boolean;
  cache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

class OptimizedApiClient {
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }

  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
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
        headers: { 'Content-Type': 'application/json' },
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
    const { showErrorToast = true, retryOnAuthError = true, cache = false, cacheTTL = 5 * 60 * 1000 } = clientOptions;
    
    // Check cache for GET requests
    if (cache && options.method === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, options);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Check if request is already in progress (deduplication)
    const requestKey = this.getCacheKey(endpoint, options);
    if (this.requestQueue.has(requestKey)) {
      const response = await this.requestQueue.get(requestKey);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create request promise
    const requestPromise = this.executeRequest(endpoint, options, clientOptions);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Cache successful GET responses
      if (cache && options.method === 'GET' && response.ok) {
        const data = await response.clone().json();
        const cacheKey = this.getCacheKey(endpoint, options);
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL,
        });
      }
      
      return response;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeRequest(
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
        headers: { ...headers, ...options.headers },
      });

      if (response.status === 401 && retryOnAuthError && session?.refreshToken) {
        const newAccessToken = await this.refreshToken(session.refreshToken);
        if (newAccessToken) {
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${newAccessToken}`, ...options.headers },
          });
          if (retryResponse.ok) {
            return retryResponse;
          }
        }
        throw new Error('Session expired. Please log in again.');
      }
      
      return response;
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (showErrorToast) {
        console.error('Error:', error.message);
      }
      throw error;
    }
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
        for (const key of Array.from(this.cache.keys())) {
            if (key.includes(pattern)) {
              this.cache.delete(key);
            }
          }
    } else {
      this.cache.clear();
    }
  }

  // HTTP methods with caching support
  async get(endpoint: string, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { method: 'GET' }, { ...options, cache: true });
  }

  async post(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }, options);
  }

  async put(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }, options);
  }

  async patch(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<Response> {
    return this.makeRequest(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
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
      headers 
    }, options);
  }
}

export const optimizedApiClient = new OptimizedApiClient();



