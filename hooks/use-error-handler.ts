import { getErrorContext, ErrorContext } from '@/lib/error-handler'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Custom hook for handling errors with user-friendly messages
 * Automatically logs errors and handles redirects
 *
 * TODO: Integrate with toast notification system when available
 */
export function useErrorHandler() {
  const router = useRouter()

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorContext = getErrorContext(error)

    // Log user-friendly error message
    console.error('[Error Handler]', {
      title: getErrorTitle(errorContext.type),
      message: customMessage || errorContext.userMessage,
      details: errorContext,
    })

    // TODO: Replace with toast notification
    // toast({
    //   title: getErrorTitle(errorContext.type),
    //   description: customMessage || errorContext.userMessage,
    //   variant: 'destructive',
    // })

    // Handle specific error types
    if (errorContext.type === 'UNAUTHORIZED') {
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/signin')
      }, 1500)
    }

    return errorContext
  }, [router])

  const handleErrorWithRetry = useCallback((
    error: unknown,
    retryFn?: () => void | Promise<void>,
    customMessage?: string
  ) => {
    const errorContext = handleError(error, customMessage)

    // If the error can be retried and a retry function is provided
    if (errorContext.canRetry && retryFn) {
      console.info('[Error Handler] Retry available for this error')
      // TODO: Replace with toast notification with retry button
      // toast({
      //   title: 'Erreur temporaire',
      //   description: errorContext.userMessage,
      //   variant: 'destructive',
      //   action: {
      //     label: 'Réessayer',
      //     onClick: () => {
      //       retryFn()
      //     },
      //   },
      // })
    }

    return errorContext
  }, [handleError])

  return {
    handleError,
    handleErrorWithRetry,
    getErrorContext,
  }
}

/**
 * Get a user-friendly title based on error type
 */
function getErrorTitle(errorType: ErrorContext['type']): string {
  switch (errorType) {
    case 'NETWORK_ERROR':
      return 'Erreur de connexion'
    case 'UNAUTHORIZED':
      return 'Session expirée'
    case 'FORBIDDEN':
      return 'Accès refusé'
    case 'NOT_FOUND':
      return 'Ressource introuvable'
    case 'VALIDATION_ERROR':
      return 'Données invalides'
    case 'SERVER_ERROR':
      return 'Erreur serveur'
    case 'UNKNOWN_ERROR':
    default:
      return 'Erreur'
  }
}
