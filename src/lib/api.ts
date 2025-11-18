const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private token: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.tokenExpiryTime = this.getTokenExpiry(this.token);
  }

  private getTokenExpiry(token: string | null): number | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiryTime) return true;
    // Considera expirado se falta menos de 1 minuto
    return Date.now() >= (this.tokenExpiryTime - 60000);
  }

  setToken(token: string | null) {
    this.token = token;
    this.tokenExpiryTime = this.getTokenExpiry(token);
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    // Verifica se o token expirou
    if (requireAuth && this.token && this.isTokenExpired()) {
      console.warn('Token expirado, limpando...');
      this.setToken(null);
      // Dispara evento customizado para forçar logout
      window.dispatchEvent(new Event('auth:token-expired'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requireAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      // Tratamento especial para 401
      if (response.status === 401 && requireAuth) {
        console.warn('401 Unauthorized - Token inválido');
        this.setToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

export interface User {
  id: string;
  email: string;
  username?: string | null;
  full_name: string;
  whatsapp: string;
  avatar_url?: string | null;
  is_founder: boolean;
  role: 'admin' | 'client';
  has_active_subscription?: boolean;
  subscription_expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  signUp: (email: string, password: string, full_name: string, whatsapp: string, username: string) =>
    apiClient.post<AuthResponse>('/auth/signup', { email, password, full_name, whatsapp, username }, { requireAuth: false }),

  signIn: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/signin', { email, password }, { requireAuth: false }),

  getMe: () => apiClient.get<{ user: User }>('/auth/me'),

  checkRole: () => apiClient.get<{ isAdmin: boolean }>('/auth/role'),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }, { requireAuth: false }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, password }, { requireAuth: false }),

  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean; username: string }>(`/auth/check-username/${username}`, { requireAuth: false }),

  updateProfile: (data: { username?: string; full_name?: string; whatsapp?: string; avatar_url?: string }) =>
    apiClient.put<{ user: User }>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),
};

export interface Game {
  id: string;
  title: string;
  cover_url: string;
  description: string;
  gradient: string;
  login: string;
  password: string;
  family_code?: string;
  tutorial: any[];
  created_at?: string;
  updated_at?: string;
}

export const gamesApi = {
  getAll: () => apiClient.get<Game[]>('/games'),

  getById: (id: string) => apiClient.get<Game>(`/games/${id}`),

  create: (game: Partial<Game>) => apiClient.post<Game>('/games', game),

  update: (id: string, game: Partial<Game>) => apiClient.put<Game>(`/games/${id}`, game),

  delete: (id: string) => apiClient.delete(`/games/${id}`),
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  max_games: number;
  description: string;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: string;
  expires_at: string | null;
  plan: SubscriptionPlan;
}

export const subscriptionsApi = {
  getMySubscription: () => apiClient.get<Subscription | null>('/subscriptions/me'),

  getFounderStatus: () => apiClient.get<{ is_founder: boolean }>('/subscriptions/founder'),

  getPlans: () => apiClient.get<SubscriptionPlan[]>('/subscriptions/plans'),

  getMyGames: () => apiClient.get<Game[]>('/subscriptions/games'),

  addGame: (game_id: string) => apiClient.post('/subscriptions/games', { game_id }),

  removeGame: (game_id: string) => apiClient.delete(`/subscriptions/games/${game_id}`),
};

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  
  update: (id: string, data: Partial<User>) => apiClient.put(`/users/${id}`, data),
  
  updateRole: (id: string, role: 'admin' | 'client') => 
    apiClient.put(`/users/${id}/role`, { role }),
  
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  
  createSubscription: (id: string, plan_id: string, duration_months: number) =>
    apiClient.post(`/users/${id}/subscription`, { plan_id, duration_months }),
  
  cancelSubscription: (id: string) => apiClient.delete(`/users/${id}/subscription`),
  
  renewSubscription: (id: string, duration_months: number) =>
    apiClient.put(`/users/${id}/subscription/renew`, { duration_months }),
};

export interface CheckoutSession {
  checkout_url: string;
  plan: string;
  price: number;
}

export interface Transaction {
  id: string;
  event: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'unknown';
  payment_method: string;
  amount: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  products: any[];
  raw_payload: any;
  created_at: string;
  updated_at: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  revenue: number;
}

export const checkoutApi = {
  getSession: () => apiClient.get<CheckoutSession>('/checkout/session'),
};

export const transactionsApi = {
  getAll: (params?: { status?: string; email?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.email) query.append('email', params.email);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return apiClient.get<TransactionsResponse>(`/transactions?${query.toString()}`);
  },
  
  getById: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),
  
  getStats: () => apiClient.get<TransactionStats>('/transactions/stats'),
};
