import { NetworkError, logError } from './error-handler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface SignUpData {
  email: string
  password: string
  role?: 'USER' | 'PRO'
  firstName?: string
  lastName?: string
  country?: string
  countries?: string[]
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
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'failed'
  createdAt: string
  updatedAt: string
}

// Dashboard interfaces
export type SessionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PRICE_VALIDATED'
  | 'PURCHASE_SUBMITTED'
  | 'PURCHASE_VALIDATED'
  | 'IN_PROGRESS'
  | 'PROCEDURES_COMPLETED'
  | 'SUBMITTED'
  | 'UGC_REQUESTED'
  | 'UGC_SUBMITTED'
  | 'PENDING_CLOSURE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface Session {
  id: string
  status: SessionStatus
  createdAt: string
  updatedAt: string
  productPrice?: number
  purchaseProof?: string
  purchaseDate?: string
  orderNumber?: string
  actualPrice?: number
  actualShipping?: number
  testData?: Record<string, any>
  feedback?: string
  cancelReason?: string
  disputeReason?: string
  disputeDescription?: string
  campaign?: {
    id: string
    title: string
    description?: string
    procedures?: Procedure[]
  }
  tester?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  seller?: {
    id: string
    email: string
    companyName?: string
  }
}

export interface ApplyToCampaignData {
  campaignId: string
}

export interface ValidatePriceData {
  productPrice: number
}

export interface SubmitPurchaseData {
  purchaseProof: string
  orderNumber?: string
  purchaseDate: string
  actualPrice: number
  actualShipping: number
}

export interface SubmitTestData {
  submissionData: Record<string, any>
}

export interface CancelSessionData {
  reason: string
}

export interface DisputeSessionData {
  reason: string
  description: string
}

// ChatOrders interfaces
export type ChatOrderType = 'UGC_REQUEST' | 'PHOTO_REQUEST' | 'TIP'

export type ChatOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED'

export interface ChatOrder {
  id: string
  sessionId: string
  buyerId: string
  sellerId: string
  type: ChatOrderType
  status: ChatOrderStatus
  amount: number
  description: string
  deliveryDeadline?: string | null
  deliveryProof?: any
  deliveredAt?: string | null
  validatedAt?: string | null
  validatedBy?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  cancelledAt?: string | null
  disputedAt?: string | null
  disputeReason?: string | null
  disputeResolvedAt?: string | null
  disputeResolution?: string | null
  disputeResolvedBy?: string | null
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface CreateChatOrderData {
  type: ChatOrderType
  amount: number
  description: string
  deliveryDeadline?: string
  metadata?: Record<string, any>
}

export interface RejectOrderData {
  rejectionReason: string
}

export interface DeliverOrderData {
  deliveryProof: {
    files: Array<{
      url: string
      filename: string
      size: number
      type: string
    }>
    notes?: string
  }
}

export interface DisputeOrderData {
  disputeReason: string
}

// Step interfaces (for test procedures)
export type StepType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'CHECKLIST' | 'RATING' | 'PRICE_VALIDATION'

export interface Step {
  id: string
  procedureId: string
  title: string
  description?: string
  type: StepType
  order: number
  isRequired: boolean
  checklistItems?: string[]
  // Price validation fields
  minPrice?: number
  maxPrice?: number
  createdAt: string
  updatedAt: string
}

export interface StepProgress {
  id: string
  sessionId: string
  stepId: string
  isCompleted: boolean
  completedAt?: string
  submissionData?: Record<string, any>
  step?: Step
}

export interface CompleteStepData {
  submissionData: Record<string, any>
}

// Review interfaces
export interface Review {
  id: string
  sessionId: string
  campaignId: string
  productId?: string
  testerId: string
  rating: number
  comment?: string
  isPublic: boolean
  republishProposed: boolean
  republishAccepted?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateReviewData {
  rating: number
  comment?: string
  isPublic?: boolean
}

// Message interfaces
export interface Message {
  id: string
  sessionId: string
  senderId: string
  recipientId?: string
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
  sender?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
}

// Notification interfaces
export type NotificationType =
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'PURCHASE_REMINDER'
  | 'TEST_VALIDATED'
  | 'PAYMENT_RECEIVED'
  | 'NEW_MESSAGE'
  | 'DISPUTE_CREATED'
  | 'DISPUTE_RESOLVED'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  readAt?: string
  relatedSessionId?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  applicationUpdates: boolean
  messages: boolean
  paymentUpdates: boolean
  marketing: boolean
}

// Wallet interfaces
export interface Wallet {
  id: string
  userId: string
  balance: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: 'CREDIT' | 'DEBIT' | 'WITHDRAWAL' | 'REFUND'
  amount: number
  balance: number
  description: string
  relatedSessionId?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export type WithdrawalMethod = 'BANK_TRANSFER' | 'GIFT_CARD'

export interface WithdrawalRequest {
  id: string
  walletId: string
  amount: number
  method: WithdrawalMethod
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  bankDetails?: {
    iban: string
    bic: string
    accountName: string
  }
  giftCardDetails?: {
    provider: string
    email: string
  }
  processedAt?: string
  createdAt: string
}

export interface CreateWithdrawalData {
  amount: number
  method: WithdrawalMethod
  bankDetails?: {
    iban: string
    bic: string
    accountName: string
  }
  giftCardDetails?: {
    provider: string
    email: string
  }
}

export interface CampaignProduct {
  productId: string
  quantity: number
  expectedPrice?: number
  shippingCost?: number
  priceRangeMin?: number
  priceRangeMax?: number
  reimbursedPrice?: boolean
  reimbursedShipping?: boolean
  bonus?: number
  product?: Product
}

// Campaign Criteria interfaces
export type GenderRequirement = 'M' | 'F' | 'ALL' | null

export interface CampaignCriteria {
  id?: string
  campaignId?: string
  minAge?: number | null
  maxAge?: number | null
  minRating?: number | null
  maxRating?: number | null
  minCompletedSessions?: number | null
  requiredGender?: GenderRequirement
  requiredCountries?: string[] | null
  requiredLocations?: string[] | null
  excludedLocations?: string[] | null
  requiredCategories?: string[] | null
  noActiveSessionWithSeller?: boolean | null
  maxSessionsPerWeek?: number | null
  maxSessionsPerMonth?: number | null
  minCompletionRate?: number | null
  maxCancellationRate?: number | null
  minAccountAge?: number | null
  lastActiveWithinDays?: number | null
  requireVerified?: boolean | null
  requirePrime?: boolean | null
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
  marketplace?: string
  products?: CampaignProduct[]
  criteria?: CampaignCriteria | null
  createdAt: string
  updatedAt: string
}

export interface CampaignCostOffer {
  productId: string
  productName: string
  quantity: number
  expectedPrice: number
  shippingCost: number
  bonus: number
  costPerUnit: number
  totalCost: number
}

export interface CampaignCostResponse {
  campaignId: string
  campaignTitle: string
  offers: CampaignCostOffer[]
  totalCampaignCost: number
  totalCampaignCostCents: number
  currency: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  productCount?: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  categoryId?: string
  asin?: string
  productUrl?: string
  price: number
  shippingCost?: number
  amazonUrl?: string // Legacy, kept for backward compatibility
  images?: Array<{
    url: string
    order: number
    isPrimary: boolean
  }> | null
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
  balance: number
  currency?: string
  // PRO-specific fields (returned by unified endpoint)
  totalCampaigns?: number
  activeCampaigns?: number
  totalProducts?: number
  testsInProgress?: number
  testsDone?: number
  totalSpent?: number
  spendingChart?: SpendingChartData[]
}

// PRO Overview interfaces
export interface SpendingChartData {
  date: string
  amount: number
  campaignCount: number
}

export interface ProOverviewStats {
  totalProducts: number
  totalCampaigns: number
  testsInProgress: number
  testsDone: number
  totalSpent: number
  spendingChart: SpendingChartData[]
}

// Procedure interfaces
export interface Procedure {
  id: string
  campaignId?: string
  title: string
  description?: string
  order: number
  isRequired: boolean
  steps?: Array<Step & { progress?: StepProgress }>
  createdAt?: string
  updatedAt?: string
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

// Criteria Template interfaces
export interface CriteriaTemplate {
  id: string
  sellerId: string
  name: string
  minAge?: number | null
  maxAge?: number | null
  minRating?: number | null
  maxRating?: number | null
  minCompletedSessions?: number | null
  requiredGender?: GenderRequirement
  requiredCountries?: string[] | null
  requiredLocations?: string[] | null
  excludedLocations?: string[] | null
  requiredCategories?: string[] | null
  noActiveSessionWithSeller?: boolean | null
  maxSessionsPerWeek?: number | null
  maxSessionsPerMonth?: number | null
  minCompletionRate?: number | null
  maxCancellationRate?: number | null
  minAccountAge?: number | null
  lastActiveWithinDays?: number | null
  requireVerified?: boolean | null
  requirePrime?: boolean | null
  createdAt: string
  updatedAt: string
}

export interface CreateCriteriaTemplateData {
  name: string
  minAge?: number | null
  maxAge?: number | null
  minRating?: number | null
  maxRating?: number | null
  minCompletedSessions?: number | null
  requiredGender?: GenderRequirement
  requiredCountries?: string[] | null
  requiredLocations?: string[] | null
  excludedLocations?: string[] | null
  requiredCategories?: string[] | null
  noActiveSessionWithSeller?: boolean | null
  maxSessionsPerWeek?: number | null
  maxSessionsPerMonth?: number | null
  minCompletionRate?: number | null
  maxCancellationRate?: number | null
  minAccountAge?: number | null
  lastActiveWithinDays?: number | null
  requireVerified?: boolean | null
  requirePrime?: boolean | null
}

export interface UpdateCriteriaTemplateData {
  name?: string
  minAge?: number | null
  maxAge?: number | null
  minRating?: number | null
  maxRating?: number | null
  minCompletedSessions?: number | null
  requiredGender?: GenderRequirement
  requiredCountries?: string[] | null
  requiredLocations?: string[] | null
  excludedLocations?: string[] | null
  requiredCategories?: string[] | null
  noActiveSessionWithSeller?: boolean | null
  maxSessionsPerWeek?: number | null
  maxSessionsPerMonth?: number | null
  minCompletionRate?: number | null
  maxCancellationRate?: number | null
  minAccountAge?: number | null
  lastActiveWithinDays?: number | null
  requireVerified?: boolean | null
  requirePrime?: boolean | null
}

// Eligible Campaign interfaces (for testers)
export interface EligibleCampaignProduct {
  product: {
    name: string
    imageUrl: string
    category?: {
      id: string
      name: string
    }
  }
  bonus: string
  reimbursedPrice: boolean
  reimbursedShipping: boolean
}

export interface EligibleCampaignSeller {
  id: string
  email: string
  companyName?: string
}

// For non-KYC users (limited data)
export interface EligibleCampaignLimited {
  id: string
  imageUrl: string
  bonus: string
  reimbursedPrice: boolean
  reimbursedShipping: boolean
  requiresKyc: true
}

// For KYC verified users (full data)
export interface EligibleCampaignFull {
  id: string
  title: string
  description?: string
  seller: EligibleCampaignSeller
  products: EligibleCampaignProduct[]
  startDate?: string
  availableSlots: number
  requiresKyc: false
}

export type EligibleCampaign = EligibleCampaignLimited | EligibleCampaignFull

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

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  transactionId: string
}

export interface CheckoutSessionResponse {
  checkoutUrl: string
  sessionId: string
  amount: number
  currency: string
  transactionId: string
}

export interface CreateCheckoutSessionData {
  successUrl: string
  cancelUrl: string
}

// Campaign Transaction interfaces
export interface CampaignTransaction {
  id: string
  type: 'CAMPAIGN_PAYMENT' | 'CAMPAIGN_REFUND'
  amount: number
  reason: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  campaignId: string
  campaign: {
    id: string
    title: string
    status: 'DRAFT' | 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  }
  stripePaymentIntentId: string | null
  stripeSessionId: string | null
  failureReason: string | null
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

export interface CampaignTransactionsResponse {
  data: CampaignTransaction[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Custom error class for API errors with validation details
export class ApiError extends Error {
  public errors?: string[]
  public statusCode?: number

  constructor(message: string, errors?: string[], statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.errors = errors
    this.statusCode = statusCode
  }
}

class ApiClient {
  private baseUrl: string
  private isRefreshing: boolean = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Tokens are now stored in httpOnly cookies, managed automatically by the browser
  }

  // Deprecated: Keep for backward compatibility but don't use localStorage anymore
  setToken(_token: string | null) {
    console.warn('setToken is deprecated: tokens are now managed via httpOnly cookies')
  }

  setRefreshToken(_token: string | null) {
    console.warn('setRefreshToken is deprecated: tokens are now managed via httpOnly cookies')
  }

  getToken() {
    console.warn('getToken is deprecated: tokens are now managed via httpOnly cookies')
    return null
  }

  getRefreshToken() {
    console.warn('getRefreshToken is deprecated: tokens are now managed via httpOnly cookies')
    return null
  }

  private async tryRefreshToken(): Promise<boolean> {
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
          credentials: 'include', // Send cookies automatically
        })

        if (!response.ok) {
          // Refresh token invalide (cookie expired or invalid)
          return false
        }

        // New access_token is set in cookie automatically by the backend
        return true
      } catch {
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
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }

      // Cookies are sent automatically, no need to add Authorization header

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Always send cookies
      })

      // Ne pas essayer de refresh sur les routes d'authentification et /me
      // Car un 401 sur ces routes signifie "pas connecté", pas "token expiré"
      const isAuthRoute = endpoint.startsWith('/auth/login') ||
                          endpoint.startsWith('/auth/signup') ||
                          endpoint.startsWith('/auth/refresh') ||
                          endpoint.startsWith('/auth/forgot-password') ||
                          endpoint.startsWith('/auth/reset-password') ||
                          endpoint.startsWith('/users/me')

      // Si erreur 401, tenter de rafraîchir le token (cookie) sauf pour les routes d'auth et /me
      if (response.status === 401 && retry && !isAuthRoute) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          // Réessayer la requête avec le nouveau token (dans le cookie)
          return this.request<T>(endpoint, options, false)
        }
        // Si le refresh a échoué, propager l'erreur 401 sans logger (utilisateur non connecté)
        const authError = new ApiError('Session expirée. Veuillez vous reconnecter.', undefined, 401)
        throw authError
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText,
        }))
        const apiError = new ApiError(
          error.message || 'Une erreur est survenue',
          error.errors,
          error.statusCode || response.status
        )
        // Ne pas logger les erreurs 401 (non authentifié est un état normal)
        if (response.status !== 401) {
          logError(apiError, `API: ${options.method || 'GET'} ${endpoint}`)
        }
        throw apiError
      }

      return response.json()
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new NetworkError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.')
        logError(networkError, `API: ${options.method || 'GET'} ${endpoint}`)
        throw networkError
      }

      // Handle other unknown errors
      logError(error, `API: ${options.method || 'GET'} ${endpoint}`)
      throw error
    }
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
    // Call backend logout to clear cookies
    await this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async completeOnboarding(data: any): Promise<Profile> {
    return this.request<Profile>('/auth/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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

  // Verification endpoints
  async initiateVerification(): Promise<{ verification_url: string; session_id: string }> {
    return this.request('/users/me/verify/initiate', {
      method: 'POST',
    })
  }

  async getVerificationStatus(): Promise<{ status: string; verified_at?: string; failure_reason?: string }> {
    return this.request('/users/me/verify/status')
  }

  async retryVerification(): Promise<{ verification_url: string; session_id: string }> {
    return this.request('/users/me/verify/retry', {
      method: 'POST',
    })
  }

  // Eligible campaigns for testers (USER role)
  async getEligibleCampaigns(page: number = 1, limit: number = 20): Promise<PaginatedResponse<EligibleCampaign>> {
    return this.request<PaginatedResponse<EligibleCampaign>>(`/campaigns/eligible?page=${page}&limit=${limit}`)
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

  async getCampaignCost(id: string): Promise<CampaignCostResponse> {
    return this.request<CampaignCostResponse>(`/campaigns/${id}/cost`)
  }

  async createCampaign(data: {
    title: string
    description?: string
    startDate?: string
    endDate?: string
    totalSlots: number
    marketplace?: string
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

  // ============= CATEGORIES =============

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories')
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`)
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.request<Category>(`/categories/slug/${slug}`)
  }

  // ============= PRODUCTS =============

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
    categoryId?: string
    asin?: string
    productUrl?: string
    price: number
    shippingCost?: number
    amazonUrl?: string // Legacy
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

  async addProductImages(productId: string, files: File[]): Promise<Product> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    const response = await this.fetch(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add images' }))
      throw new Error(error.message || 'Failed to add images')
    }

    return response.json()
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

  // Get unified dashboard stats (OPTIMIZED - single request)
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/users/me/dashboard')
  }

  // Get PRO overview with spending chart
  async getProOverview(): Promise<ProOverviewStats> {
    return this.request<ProOverviewStats>('/users/me/overview')
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

  // Criteria Templates endpoints
  async getCriteriaTemplates(page: number = 1, limit: number = 100): Promise<CriteriaTemplate[]> {
    const response = await this.request<PaginatedResponse<CriteriaTemplate>>(`/criteria-templates?page=${page}&limit=${limit}`)
    return response.data
  }

  async getCriteriaTemplatesPaginated(page: number = 1, limit: number = 20): Promise<PaginatedResponse<CriteriaTemplate>> {
    return this.request<PaginatedResponse<CriteriaTemplate>>(`/criteria-templates?page=${page}&limit=${limit}`)
  }

  async getCriteriaTemplate(id: string): Promise<CriteriaTemplate> {
    return this.request<CriteriaTemplate>(`/criteria-templates/${id}`)
  }

  async createCriteriaTemplate(data: CreateCriteriaTemplateData): Promise<CriteriaTemplate> {
    return this.request<CriteriaTemplate>('/criteria-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCriteriaTemplate(id: string, data: UpdateCriteriaTemplateData): Promise<CriteriaTemplate> {
    return this.request<CriteriaTemplate>(`/criteria-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCriteriaTemplate(id: string): Promise<{ message: string }> {
    return this.request(`/criteria-templates/${id}`, {
      method: 'DELETE',
    })
  }

  async applyCriteriaTemplateToCampaign(templateId: string, campaignId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/criteria-templates/${templateId}/apply/${campaignId}`, {
      method: 'POST',
    })
  }

  // Campaign Criteria endpoints
  async createCampaignCriteria(campaignId: string, data: Partial<CampaignCriteria>): Promise<CampaignCriteria> {
    return this.request<CampaignCriteria>(`/campaigns/${campaignId}/criteria`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCampaignCriteria(campaignId: string): Promise<CampaignCriteria | null> {
    try {
      return await this.request<CampaignCriteria>(`/campaigns/${campaignId}/criteria`)
    } catch (error) {
      // If criteria don't exist, return null
      return null
    }
  }

  async updateCampaignCriteria(campaignId: string, data: Partial<CampaignCriteria>): Promise<CampaignCriteria> {
    return this.request<CampaignCriteria>(`/campaigns/${campaignId}/criteria`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCampaignCriteria(campaignId: string): Promise<{ message: string }> {
    return this.request(`/campaigns/${campaignId}/criteria`, {
      method: 'DELETE',
    })
  }

  // Payment endpoints
  async createPaymentIntent(campaignId: string): Promise<PaymentIntentResponse> {
    return this.request<PaymentIntentResponse>(`/campaigns/${campaignId}/payment-intent`, {
      method: 'POST',
    })
  }

  async createCheckoutSession(campaignId: string, data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
    return this.request<CheckoutSessionResponse>(`/campaigns/${campaignId}/checkout-session`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Transactions
  async getMyTransactions(page: number = 1, limit: number = 20): Promise<CampaignTransactionsResponse> {
    return this.request<CampaignTransactionsResponse>(`/campaigns/my-transactions?page=${page}&limit=${limit}`, {
      method: 'GET',
    })
  }

  // Sessions endpoints (for testers)
  async applyToCampaign(data: ApplyToCampaignData): Promise<Session> {
    return this.request<Session>('/sessions/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMySessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions')
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`)
  }

  async validatePrice(sessionId: string, data: ValidatePriceData): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/validate-price`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async submitPurchase(sessionId: string, data: SubmitPurchaseData): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/submit-purchase`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async submitTest(sessionId: string, data: SubmitTestData): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/submit-test`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async cancelSession(sessionId: string, data: CancelSessionData): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async disputeSession(sessionId: string, data: DisputeSessionData): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/dispute`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Step Progress endpoints
  async getSessionSteps(sessionId: string): Promise<StepProgress[]> {
    return this.request<StepProgress[]>(`/sessions/${sessionId}/steps`)
  }

  async completeStep(sessionId: string, stepId: string, data: CompleteStepData): Promise<StepProgress> {
    return this.request<StepProgress>(`/sessions/${sessionId}/steps/${stepId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteStepProgress(sessionId: string, stepId: string): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/steps/${stepId}/progress`, {
      method: 'DELETE',
    })
  }

  // Review endpoints
  async createReview(sessionId: string, data: CreateReviewData): Promise<Review> {
    return this.request<Review>(`/reviews/sessions/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMyReviews(): Promise<Review[]> {
    return this.request<Review[]>('/reviews/my-reviews')
  }

  async acceptRepublish(reviewId: string): Promise<Review> {
    return this.request<Review>(`/reviews/${reviewId}/accept-republish`, {
      method: 'PATCH',
    })
  }

  async declineRepublish(reviewId: string): Promise<Review> {
    return this.request<Review>(`/reviews/${reviewId}/decline-republish`, {
      method: 'PATCH',
    })
  }

  // Message endpoints
  async sendMessage(sessionId: string, content: string, attachments: string[] = []): Promise<Message> {
    return this.request<Message>(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    })
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    return this.request<Message[]>(`/sessions/${sessionId}/messages`)
  }

  async markAllMessagesAsRead(sessionId: string): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/sessions/${sessionId}/messages/read-all`, {
      method: 'PATCH',
    })
  }

  // Notification endpoints
  async getMyNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications')
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/notifications/preferences')
  }

  async updateNotificationPreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Wallet endpoints
  async getMyWallet(): Promise<Wallet> {
    return this.request<Wallet>('/wallets/my-wallet')
  }

  async getWalletTransactions(limit: number = 50): Promise<WalletTransaction[]> {
    return this.request<WalletTransaction[]>(`/wallets/my-wallet/transactions?limit=${limit}`)
  }

  async createWithdrawal(data: CreateWithdrawalData): Promise<WithdrawalRequest> {
    return this.request<WithdrawalRequest>('/wallets/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMyWithdrawals(): Promise<WithdrawalRequest[]> {
    return this.request<WithdrawalRequest[]>('/wallets/my-withdrawals')
  }

  // PRO Seller - Campaign Applications endpoints
  async getCampaignApplications(campaignId: string, status?: string): Promise<{data: Session[], meta?: PaginationMeta}> {
    const params = status ? `?status=${status}` : ''
    return this.request<{data: Session[], meta?: PaginationMeta}>(`/campaigns/${campaignId}/applications${params}`)
  }

  async acceptSession(sessionId: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/accept`, {
      method: 'PATCH'
    })
  }

  async rejectSession(sessionId: string, rejectionReason: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason })
    })
  }

  async validateSession(sessionId: string, rating: number, ratingComment?: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/validate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, ratingComment })
    })
  }

  async rateSession(sessionId: string, rating: number, ratingComment?: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, ratingComment })
    })
  }

  async validatePurchase(sessionId: string, comment?: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/validate-purchase`, {
      method: 'PATCH',
      body: JSON.stringify({ comment })
    })
  }

  async rejectPurchase(sessionId: string, rejectionReason: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/reject-purchase`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason })
    })
  }

  // ChatOrders endpoints
  async createChatOrder(sessionId: string, data: CreateChatOrderData): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/sessions/${sessionId}/orders`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getSessionOrders(sessionId: string): Promise<ChatOrder[]> {
    return this.request<ChatOrder[]>(`/chat-orders/sessions/${sessionId}/orders`)
  }

  async getChatOrder(orderId: string): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}`)
  }

  async acceptChatOrder(orderId: string): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/accept`, {
      method: 'POST'
    })
  }

  async rejectChatOrder(orderId: string, data: RejectOrderData): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async cancelChatOrder(orderId: string): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/cancel`, {
      method: 'POST'
    })
  }

  async deliverChatOrder(orderId: string, data: DeliverOrderData): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/deliver`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async validateChatOrderDelivery(orderId: string): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/validate`, {
      method: 'POST'
    })
  }

  // Alias pour validateChatOrderDelivery (plus court)
  async validateChatOrder(orderId: string): Promise<ChatOrder> {
    return this.validateChatOrderDelivery(orderId)
  }

  async disputeChatOrder(orderId: string, data: DisputeOrderData): Promise<ChatOrder> {
    return this.request<ChatOrder>(`/chat-orders/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Close session (PRO only)
  async closeSession(sessionId: string, closingMessage?: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}/close`, {
      method: 'PATCH',
      body: JSON.stringify({ closingMessage })
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
