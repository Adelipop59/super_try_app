const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface SignUpData {
  email: string
  password: string
  role?: 'USER' | 'PRO'
  firstName?: string
  lastName?: string
  phone?: string
  companyName?: string
  siret?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  profile: Profile
}

export interface Profile {
  id: string
  supabaseUserId: string
  email: string
  role: 'USER' | 'PRO' | 'ADMIN'
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  companyName?: string
  siret?: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// Dashboard interfaces
export interface Session {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  campaign?: {
    id: string
    title: string
  }
  tester?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface Campaign {
  id: string
  title: string
  description?: string
  status: string
  totalSlots: number
  usedSlots: number
  startDate?: string
  endDate?: string
  productId?: string
  product?: Product
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  amazonUrl?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WalletBalance {
  balance: number
  currency: string
}

export interface Transaction {
  id: string
  type: string
  amount: number
  description?: string
  createdAt: string
}

export interface DashboardStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  pendingSessions: number
  totalCampaigns?: number
  activeCampaigns?: number
  totalProducts?: number
  balance: number
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl

    // Récupérer le token du localStorage si disponible
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(error.message || 'Une erreur est survenue')
    }

    return response.json()
  }

  // Auth endpoints
  async signUp(data: SignUpData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe(): Promise<Profile> {
    return this.request<Profile>('/users/me')
  }

  async verifyToken(): Promise<{ valid: boolean; user?: Profile }> {
    return this.request('/auth/verify')
  }

  async signOut() {
    this.setToken(null)
  }

  // Users endpoints
  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Dashboard endpoints
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions')
  }

  async getMyCampaigns(): Promise<Campaign[]> {
    return this.request<Campaign[]>('/campaigns/my-campaigns')
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}`)
  }

  async createCampaign(data: {
    title: string
    description?: string
    startDate?: string
    endDate?: string
    totalSlots: number
    productId?: string
  }): Promise<Campaign> {
    return this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    })
  }

  async getMyProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/my-products')
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`)
  }

  async createProduct(data: {
    name: string
    description?: string
    price: number
    amazonUrl?: string
    imageUrl?: string
  }): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async getWalletBalance(): Promise<WalletBalance> {
    return this.request<WalletBalance>('/wallets/me/balance')
  }

  async getTransactions(limit: number = 50): Promise<{
    transactions: Transaction[]
    total: number
  }> {
    return this.request(`/wallets/me/transactions?limit=${limit}`)
  }

  // Get dashboard stats based on user role
  async getDashboardStats(): Promise<DashboardStats> {
    const [sessionsRes, balanceRes] = await Promise.all([
      this.getSessions().catch(() => []),
      this.getWalletBalance().catch(() => ({ balance: 0, currency: 'EUR' }))
    ])

    const sessions = sessionsRes || []
    const balance = balanceRes?.balance || 0

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => ['ACCEPTED', 'PURCHASE_SUBMITTED', 'IN_PROGRESS'].includes(s.status)).length,
      completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
      pendingSessions: sessions.filter(s => s.status === 'PENDING').length,
      balance
    }
  }

  // Get PRO dashboard stats
  async getProDashboardStats(): Promise<DashboardStats> {
    const [sessionsRes, campaignsRes, productsRes, balanceRes] = await Promise.all([
      this.getSessions().catch(() => []),
      this.getMyCampaigns().catch(() => []),
      this.getMyProducts().catch(() => []),
      this.getWalletBalance().catch(() => ({ balance: 0, currency: 'EUR' }))
    ])

    const sessions = sessionsRes || []
    const campaigns = campaignsRes || []
    const products = productsRes || []
    const balance = balanceRes?.balance || 0

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => ['ACCEPTED', 'PURCHASE_SUBMITTED', 'IN_PROGRESS'].includes(s.status)).length,
      completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
      pendingSessions: sessions.filter(s => s.status === 'PENDING').length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
      totalProducts: products.length,
      balance
    }
  }
}

export const api = new ApiClient(API_BASE_URL)
