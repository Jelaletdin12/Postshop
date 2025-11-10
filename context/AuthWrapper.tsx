"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStatus, useGetGuestToken } from "@/lib/hooks/useAuth"

interface AuthWrapperProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
  locale: string
}

/**
 * AuthWrapper - Protects routes and manages authentication state
 * 
 * Usage:
 * - Wrap protected pages: <AuthWrapper requireAuth>{content}</AuthWrapper>
 * - Wrap public pages: <AuthWrapper>{content}</AuthWrapper>
 */
export default function AuthWrapper({
  children,
  requireAuth = false,
  redirectTo,
  locale,
}: AuthWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAuthStatus()
  const { mutate: getGuestToken, isPending: isGettingGuestToken } = useGetGuestToken()

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading || isGettingGuestToken) return

    // If auth required and user not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirect = redirectTo || `/${locale}/login`
      const returnUrl = pathname !== redirect ? `?returnUrl=${encodeURIComponent(pathname)}` : ""
      router.push(`${redirect}${returnUrl}`)
      return
    }

    // If already authenticated and trying to access login/register
    if (isAuthenticated && (pathname.includes("/login") || pathname.includes("/register"))) {
      router.push(`/${locale}`)
      return
    }

    // Ensure guest token exists for non-authenticated users
    if (!isAuthenticated && !requireAuth) {
      const hasGuestToken = document.cookie
        .split("; ")
        .some((row) => row.startsWith("guestToken="))
      
      if (!hasGuestToken) {
        getGuestToken()
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, router, locale, redirectTo, getGuestToken, isGettingGuestToken])

  // Show loading state
  if (isLoading || (requireAuth && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return <>{children}</>
}