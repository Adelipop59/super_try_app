import { Session, SessionStatus } from './api'

/**
 * Session State Helpers
 * Centralise la logique de gestion des états de session
 */

// ============================================================================
// STATUS VALIDATION HELPERS
// ============================================================================

/**
 * Vérifie si le testeur peut valider le prix du produit
 */
export const canValidatePrice = (session: Session): boolean => {
  return session.status === 'PROCEDURES_COMPLETED'
}

/**
 * Vérifie si le testeur peut soumettre son achat
 */
export const canSubmitPurchase = (session: Session): boolean => {
  return session.status === 'PRICE_VALIDATED'
}

/**
 * Vérifie si le testeur peut soumettre le test final
 */
export const canSubmitTest = (session: Session): boolean => {
  return session.status === 'PURCHASE_VALIDATED'
}

/**
 * Vérifie si la session peut être annulée
 */
export const canCancelSession = (status: SessionStatus): boolean => {
  return [
    'PENDING',
    'ACCEPTED',
    'IN_PROGRESS',
    'PROCEDURES_COMPLETED',
    'PRICE_VALIDATED',
    'PURCHASE_SUBMITTED',
    'PURCHASE_VALIDATED',
  ].includes(status)
}

// ============================================================================
// PROCEDURE VISIBILITY HELPERS
// ============================================================================

/**
 * Détermine si les procédures doivent être affichées
 */
export const shouldShowProcedures = (status: SessionStatus): boolean => {
  return ['ACCEPTED', 'IN_PROGRESS', 'PROCEDURES_COMPLETED'].includes(status)
}

/**
 * Détermine si les procédures sont en lecture seule
 */
export const areProceduresReadOnly = (status: SessionStatus): boolean => {
  return [
    'PROCEDURES_COMPLETED',
    'PRICE_VALIDATED',
    'PURCHASE_SUBMITTED',
    'PURCHASE_VALIDATED',
    'SUBMITTED',
    'COMPLETED',
  ].includes(status)
}

// ============================================================================
// LEGACY STATUS SUPPORT
// ============================================================================

/**
 * Normalise les anciens statuts vers les nouveaux
 * Permet une migration progressive sans casser les sessions existantes
 */
export const normalizeStatus = (status: string): SessionStatus => {
  const legacyMap: Record<string, SessionStatus> = {
    UGC_REQUESTED: 'COMPLETED',
    UGC_SUBMITTED: 'COMPLETED',
    PENDING_CLOSURE: 'COMPLETED',
  }
  return (legacyMap[status] as SessionStatus) ?? (status as SessionStatus)
}

/**
 * Vérifie si un statut est legacy (obsolète)
 */
export const isLegacyStatus = (status: string): boolean => {
  return ['UGC_REQUESTED', 'UGC_SUBMITTED', 'PENDING_CLOSURE'].includes(status)
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Retourne le message d'action suivante pour le testeur
 */
export const getNextActionMessage = (status: SessionStatus): string | null => {
  switch (status) {
    case 'PENDING':
      return 'En attente de validation par le vendeur'
    case 'ACCEPTED':
    case 'IN_PROGRESS':
      return 'Complétez toutes les procédures obligatoires'
    case 'PROCEDURES_COMPLETED':
      return 'Validez le prix du produit'
    case 'PRICE_VALIDATED':
      return 'Commandez le produit et soumettez votre preuve d\'achat'
    case 'PURCHASE_SUBMITTED':
      return 'En attente de validation de votre commande'
    case 'PURCHASE_VALIDATED':
      return 'Soumettez votre test final'
    case 'SUBMITTED':
      return 'En attente de validation de votre test'
    case 'COMPLETED':
      return 'Session terminée - Vous pouvez échanger des UGC avec le vendeur'
    case 'REJECTED':
      return 'Votre candidature a été refusée'
    case 'CANCELLED':
      return 'Session annulée'
    case 'DISPUTED':
      return 'Litige en cours de résolution'
    default:
      return null
  }
}

/**
 * Retourne un message d'erreur si l'action n'est pas possible
 */
export const getActionBlockedReason = (
  action: 'validatePrice' | 'submitPurchase' | 'submitTest',
  session: Session
): string | null => {
  switch (action) {
    case 'validatePrice':
      if (session.status !== 'PROCEDURES_COMPLETED') {
        return 'Vous devez d\'abord compléter toutes les procédures obligatoires'
      }
      return null

    case 'submitPurchase':
      if (session.status !== 'PRICE_VALIDATED') {
        return 'Vous devez d\'abord valider le prix du produit'
      }
      return null

    case 'submitTest':
      if (session.status !== 'PURCHASE_VALIDATED') {
        return 'Votre commande doit d\'abord être validée par le vendeur'
      }
      return null

    default:
      return null
  }
}

// ============================================================================
// STATE MACHINE (Optionnel - pour future implémentation)
// ============================================================================

/**
 * Machine à états pour les sessions
 * Définit toutes les transitions valides
 */
export const SESSION_STATE_MACHINE = {
  PENDING: {
    canTransitionTo: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    allowedActions: ['cancel'],
    showProcedures: false,
    proceduresReadOnly: false,
  },
  ACCEPTED: {
    canTransitionTo: ['IN_PROGRESS', 'CANCELLED'],
    allowedActions: ['startProcedures', 'cancel'],
    showProcedures: true,
    proceduresReadOnly: false,
  },
  IN_PROGRESS: {
    canTransitionTo: ['PROCEDURES_COMPLETED', 'CANCELLED'],
    allowedActions: ['completeProcedures', 'cancel'],
    showProcedures: true,
    proceduresReadOnly: false,
  },
  PROCEDURES_COMPLETED: {
    canTransitionTo: ['PRICE_VALIDATED', 'CANCELLED'],
    allowedActions: ['validatePrice', 'cancel'],
    showProcedures: true,
    proceduresReadOnly: true,
  },
  PRICE_VALIDATED: {
    canTransitionTo: ['PURCHASE_SUBMITTED', 'CANCELLED'],
    allowedActions: ['submitPurchase', 'cancel'],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  PURCHASE_SUBMITTED: {
    canTransitionTo: ['PURCHASE_VALIDATED', 'CANCELLED', 'DISPUTED'],
    allowedActions: ['cancel', 'dispute'],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  PURCHASE_VALIDATED: {
    canTransitionTo: ['SUBMITTED', 'CANCELLED', 'DISPUTED'],
    allowedActions: ['submitTest', 'cancel', 'dispute'],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  SUBMITTED: {
    canTransitionTo: ['COMPLETED', 'DISPUTED'],
    allowedActions: ['dispute'],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  COMPLETED: {
    canTransitionTo: ['DISPUTED'],
    allowedActions: ['leaveReview'],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  REJECTED: {
    canTransitionTo: [],
    allowedActions: [],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  CANCELLED: {
    canTransitionTo: [],
    allowedActions: [],
    showProcedures: false,
    proceduresReadOnly: true,
  },
  DISPUTED: {
    canTransitionTo: ['COMPLETED', 'CANCELLED'],
    allowedActions: [],
    showProcedures: false,
    proceduresReadOnly: true,
  },
} as const

/**
 * Vérifie si une transition de statut est valide
 */
export const canTransitionTo = (
  from: SessionStatus,
  to: SessionStatus
): boolean => {
  // Normalise les anciens statuts d'abord
  const normalizedFrom = normalizeStatus(from)
  const stateConfig = SESSION_STATE_MACHINE[normalizedFrom as keyof typeof SESSION_STATE_MACHINE]
  if (!stateConfig) return false
  return (stateConfig.canTransitionTo as readonly string[]).includes(to)
}
