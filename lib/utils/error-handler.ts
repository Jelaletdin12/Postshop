/**
 * Centralized error handling utility
 * Converts API errors to user-friendly messages
 */

export interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
  status?: number
}

export function getErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred"

  // Axios error
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.status === 401) {
    return "Please log in to continue"
  }

  if (error.response?.status === 403) {
    return "You don't have permission to perform this action"
  }

  if (error.response?.status === 404) {
    return "The requested resource was not found"
  }

  if (error.response?.status === 500) {
    return "Server error occurred. Please try again later"
  }

  if (error.message === "Network Error") {
    return "Network connection error. Please check your internet connection"
  }

  if (typeof error === "string") {
    return error
  }

  return "An error occurred. Please try again"
}

export function getValidationErrors(error: any): Record<string, string> {
  if (error.response?.data?.errors && typeof error.response.data.errors === "object") {
    const errors: Record<string, string> = {}
    for (const [key, messages] of Object.entries(error.response.data.errors)) {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
    }
    return errors
  }
  return {}
}

export function isNetworkError(error: any): boolean {
  return error?.message === "Network Error" || !error?.response
}

export function isUnauthorized(error: any): boolean {
  return error?.response?.status === 401
}

export function isForbidden(error: any): boolean {
  return error?.response?.status === 403
}

export function isNotFound(error: any): boolean {
  return error?.response?.status === 404
}

export function isServerError(error: any): boolean {
  return error?.response?.status >= 500
}
