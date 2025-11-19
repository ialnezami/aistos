import Stripe from 'stripe'

/**
 * Handle Stripe API errors gracefully
 */
export function handleStripeError(error: unknown): {
  message: string
  code?: string
  statusCode: number
  userMessage: string
} {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card was declined
    return {
      message: error.message,
      code: error.code,
      statusCode: 402,
      userMessage: 'Votre carte a été refusée. Veuillez vérifier les informations de votre carte ou utiliser une autre méthode de paiement.',
    }
  }

  if (error instanceof Stripe.errors.StripeRateLimitError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: 429,
      userMessage: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
    }
  }

  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: 400,
      userMessage: 'Requête invalide. Veuillez vérifier les informations fournies.',
    }
  }

  if (error instanceof Stripe.errors.StripeAPIError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: 500,
      userMessage: 'Erreur du service de paiement. Veuillez réessayer plus tard.',
    }
  }

  if (error instanceof Stripe.errors.StripeConnectionError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: 503,
      userMessage: 'Impossible de se connecter au service de paiement. Veuillez réessayer plus tard.',
    }
  }

  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    console.error('Stripe authentication error:', error)
    return {
      message: 'Stripe authentication failed',
      code: error.code,
      statusCode: 500,
      userMessage: 'Erreur de configuration du service de paiement.',
    }
  }

  // Generic error
  console.error('Unknown Stripe error:', error)
  return {
    message: error instanceof Error ? error.message : 'Erreur de paiement inconnue',
    statusCode: 500,
    userMessage: 'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.',
  }
}

