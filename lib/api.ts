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

export interface CampaignProduct {
  productId: string
  quantity: number
  expectedPrice?: number
  priceRangeMin?: number
  priceRangeMax?: number
  product?: Product
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
  products?: CampaignProduct[]
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

// Procedure interfaces
export interface Procedure {
  id: string
  campaignId: string
  title: string
  description: string
  order: number
  isRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProcedureData {
  title: string
  description: string
  order: number
  isRequired?: boolean
}

export interface UpdateProcedureData {
  title?: string
  description?: string
  order?: number
  isRequired?: boolean
}

// Distribution interfaces
export type DistributionType = 'RECURRING' | 'SPECIFIC_DATE'

export interface Distribution {
  id: string
  campaignId: string
  type: DistributionType
  dayOfWeek?: number | null
  dayName?: string | null
  specificDate?: string | null
  maxUnits: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDistributionData {
  type: DistributionType
  dayOfWeek?: number
  specificDate?: string
  maxUnits: number
  isActive?: boolean
}

export interface UpdateDistributionData {
  type?: DistributionType
  dayOfWeek?: number
  specificDate?: string
  maxUnits?: number
  isActive?: boolean
}

// Procedure Template interfaces
export type StepType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'CHECKLIST' | 'RATING' | 'PRICE_VALIDATION'

export interface StepTemplate {
  id: string
  title: string
  description?: string
  type: StepType
  order: number
  isRequired: boolean
  checklistItems?: string[]
  createdAt: string
  updatedAt: string
}

export interface ProcedureTemplate {
  id: string
  sellerId: string
  name: string
  title: string
  description: string
  steps: StepTemplate[]
  createdAt: string
  updatedAt: string
}

export interface CreateStepTemplateData {
  title: string
  description?: string
  type?: StepType
  order: number
  isRequired?: boolean
  checklistItems?: string[]
}

export interface CreateProcedureTemplateData {
  name: string
  title: string
  description: string
  steps?: CreateStepTemplateData[]
}

export interface UpdateProcedureTemplateData {
  name?: string
  title?: string
  description?: string
  steps?: CreateStepTemplateData[]
}

// Pagination interfaces
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  companyName?: string
  siret?: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface UpdateEmailData {
  email: string
  password: string
}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl

    // Récupérer les tokens du localStorage si disponible
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      this.refreshToken = localStorage.getItem('refresh_token')
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

  setRefreshToken(token: string | null) {
    this.refreshToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('refresh_token', token)
      } else {
        localStorage.removeItem('refresh_token')
      }
    }
  }

  getToken() {
    return this.token
  }

  getRefreshToken() {
    return this.refreshToken
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    // Si un refresh est déjà en cours, attendre sa résolution
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        })

        if (!response.ok) {
          // Refresh token invalide, nettoyer les tokens
          this.setToken(null)
          this.setRefreshToken(null)
          return false
        }

        const data: RefreshTokenResponse = await response.json()
        this.setToken(data.access_token)
        return true
      } catch {
        this.setToken(null)
        this.setRefreshToken(null)
        return false
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // Si erreur 401 et qu'on a un refresh token, tenter de rafraîchir
    if (response.status === 401 && retry && this.refreshToken) {
      const refreshed = await this.tryRefreshToken()
      if (refreshed) {
        // Réessayer la requête avec le nouveau token
        return this.request<T>(endpoint, options, false)
      }
      // Si le refresh a échoué, propager l'erreur 401
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

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
    this.setRefreshToken(null)
  }

  // Users endpoints
  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    return this.request<Profile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async updateEmail(data: UpdateEmailData): Promise<{ message: string }> {
    return this.request('/auth/update-email', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Dashboard endpoints
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions')
  }

  async getMyCampaigns(page: number = 1, limit: number = 100): Promise<Campaign[]> {
    const response = await this.request<PaginatedResponse<Campaign>>(`/campaigns/my-campaigns?page=${page}&limit=${limit}`)
    return response.data
  }

  async getMyCampaignsPaginated(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Campaign>> {
    return this.request<PaginatedResponse<Campaign>>(`/campaigns/my-campaigns?page=${page}&limit=${limit}`)
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
    products?: {
      productId: string
      quantity: number
      expectedPrice?: number
    }[]
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

  async getMyProducts(page: number = 1, limit: number = 100): Promise<Product[]> {
    const response = await this.request<PaginatedResponse<Product>>(`/products/my-products?page=${page}&limit=${limit}`)
    return response.data
  }

  async getMyProductsPaginated(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(`/products/my-products?page=${page}&limit=${limit}`)
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

  // Procedures endpoints
  async getProcedures(campaignId: string): Promise<Procedure[]> {
    return this.request<Procedure[]>(`/campaigns/${campaignId}/procedures`)
  }

  async getProcedure(campaignId: string, procedureId: string): Promise<Procedure> {
    return this.request<Procedure>(`/campaigns/${campaignId}/procedures/${procedureId}`)
  }

  async createProcedure(campaignId: string, data: CreateProcedureData): Promise<Procedure> {
    return this.request<Procedure>(`/campaigns/${campaignId}/procedures`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProcedure(campaignId: string, procedureId: string, data: UpdateProcedureData): Promise<Procedure> {
    return this.request<Procedure>(`/campaigns/${campaignId}/procedures/${procedureId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProcedure(campaignId: string, procedureId: string): Promise<{ message: string }> {
    return this.request(`/campaigns/${campaignId}/procedures/${procedureId}`, {
      method: 'DELETE',
    })
  }

  async reorderProcedures(campaignId: string, procedureIds: string[]): Promise<Procedure[]> {
    return this.request<Procedure[]>(`/campaigns/${campaignId}/procedures/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ procedureIds }),
    })
  }

  // Distributions endpoints
  async getDistributions(campaignId: string, page: number = 1, limit: number = 100): Promise<Distribution[]> {
    const response = await this.request<PaginatedResponse<Distribution>>(`/campaigns/${campaignId}/distributions?page=${page}&limit=${limit}`)
    return response.data
  }

  async getDistributionsPaginated(campaignId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Distribution>> {
    return this.request<PaginatedResponse<Distribution>>(`/campaigns/${campaignId}/distributions?page=${page}&limit=${limit}`)
  }

  async getDistribution(campaignId: string, distributionId: string): Promise<Distribution> {
    return this.request<Distribution>(`/campaigns/${campaignId}/distributions/${distributionId}`)
  }

  async createDistribution(campaignId: string, data: CreateDistributionData): Promise<Distribution> {
    return this.request<Distribution>(`/campaigns/${campaignId}/distributions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createDistributions(campaignId: string, distributions: CreateDistributionData[]): Promise<Distribution[]> {
    return this.request<Distribution[]>(`/campaigns/${campaignId}/distributions/batch`, {
      method: 'POST',
      body: JSON.stringify(distributions),
    })
  }

  async updateDistribution(campaignId: string, distributionId: string, data: UpdateDistributionData): Promise<Distribution> {
    return this.request<Distribution>(`/campaigns/${campaignId}/distributions/${distributionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteDistribution(campaignId: string, distributionId: string): Promise<{ message: string }> {
    return this.request(`/campaigns/${campaignId}/distributions/${distributionId}`, {
      method: 'DELETE',
    })
  }

  // Procedure Templates endpoints
  async getProcedureTemplates(page: number = 1, limit: number = 100): Promise<ProcedureTemplate[]> {
    const response = await this.request<PaginatedResponse<ProcedureTemplate>>(`/procedure-templates?page=${page}&limit=${limit}`)
    return response.data
  }

  async getProcedureTemplatesPaginated(page: number = 1, limit: number = 20): Promise<PaginatedResponse<ProcedureTemplate>> {
    return this.request<PaginatedResponse<ProcedureTemplate>>(`/procedure-templates?page=${page}&limit=${limit}`)
  }

  async getProcedureTemplate(id: string): Promise<ProcedureTemplate> {
    return this.request<ProcedureTemplate>(`/procedure-templates/${id}`)
  }

  async createProcedureTemplate(data: CreateProcedureTemplateData): Promise<ProcedureTemplate> {
    return this.request<ProcedureTemplate>('/procedure-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProcedureTemplate(id: string, data: UpdateProcedureTemplateData): Promise<ProcedureTemplate> {
    return this.request<ProcedureTemplate>(`/procedure-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProcedureTemplate(id: string): Promise<{ message: string }> {
    return this.request(`/procedure-templates/${id}`, {
      method: 'DELETE',
    })
  }

  async copyTemplateToCampaign(templateId: string, campaignId: string, order: number): Promise<Procedure> {
    return this.request<Procedure>(`/procedure-templates/${templateId}/copy-to-campaign/${campaignId}`, {
      method: 'POST',
      body: JSON.stringify({ order }),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
