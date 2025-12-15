/**
 * Centralized error handling utilities
 */

export class NetworkError extends Error {
  constructor(message: string = 'Erreur de connexion au serveur') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Error type definitions
export type ErrorType =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

export interface ErrorContext {
  type: ErrorType
  message: string
  userMessage: string
  statusCode?: number
  details?: unknown
  canRetry: boolean
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
export const getErrorContext = (error: unknown): ErrorContext => {
  // Network errors
  if (error instanceof NetworkError || (error instanceof Error && error.message.includes('fetch'))) {
    return {
      type: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network error',
      userMessage: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      canRetry: true
    }
  }

  // API errors with status codes (checking for statusCode property instead of instanceof)
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const apiError = error as { message: string; statusCode?: number; errors?: string[]; details?: unknown }
    switch (apiError.statusCode) {
      case 400:
        return {
          type: 'VALIDATION_ERROR',
          message: apiError.message,
          userMessage: apiError.message || 'Les données fournies sont invalides.',
          statusCode: 400,
          details: apiError.errors || apiError.details,
          canRetry: false
        }

      case 401:
        return {
          type: 'UNAUTHORIZED',
          message: apiError.message,
          userMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
          statusCode: 401,
          canRetry: false
        }

      case 403:
        return {
          type: 'FORBIDDEN',
          message: apiError.message,
          userMessage: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
          statusCode: 403,
          canRetry: false
        }

      case 404:
        return {
          type: 'NOT_FOUND',
          message: apiError.message,
          userMessage: 'La ressource demandée n\'existe pas.',
          statusCode: 404,
          canRetry: false
        }

      case 409:
        return {
          type: 'VALIDATION_ERROR',
          message: apiError.message,
          userMessage: apiError.message || 'Cette action est en conflit avec l\'état actuel.',
          statusCode: 409,
          canRetry: false
        }

      case 422:
        return {
          type: 'VALIDATION_ERROR',
          message: apiError.message,
          userMessage: apiError.message || 'Les données fournies sont incorrectes.',
          statusCode: 422,
          details: apiError.errors || apiError.details,
          canRetry: false
        }

      case 429:
        return {
          type: 'SERVER_ERROR',
          message: apiError.message,
          userMessage: 'Trop de requêtes. Veuillez patienter quelques instants.',
          statusCode: 429,
          canRetry: true
        }

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'SERVER_ERROR',
          message: apiError.message,
          userMessage: 'Une erreur serveur s\'est produite. Veuillez réessayer dans quelques instants.',
          statusCode: apiError.statusCode,
          canRetry: true
        }

      default:
        return {
          type: 'UNKNOWN_ERROR',
          message: apiError.message,
          userMessage: apiError.message || 'Une erreur inattendue s\'est produite.',
          statusCode: apiError.statusCode,
          canRetry: true
        }
    }
  }

  // Validation errors
  if (error instanceof ValidationError) {
    return {
      type: 'VALIDATION_ERROR',
      message: error.message,
      userMessage: error.message,
      details: error.fields,
      canRetry: false
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'Une erreur inattendue s\'est produite.',
      canRetry: true
    }
  }

  // Unknown error type
  return {
    type: 'UNKNOWN_ERROR',
    message: String(error),
    userMessage: 'Une erreur inattendue s\'est produite.',
    canRetry: true
  }
}

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (fields?: Record<string, string[]>): string => {
  if (!fields) return ''

  return Object.entries(fields)
    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
    .join('\n')
}

/**
 * Log error for debugging (can be extended to send to monitoring service)
 */
export const logError = (error: unknown, context?: string) => {
  const errorContext = getErrorContext(error)

  console.error('Error occurred:', {
    context,
    type: errorContext.type,
    message: errorContext.message,
    statusCode: errorContext.statusCode,
    details: errorContext.details,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  })

  // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoring(error, context)
  // }
}
