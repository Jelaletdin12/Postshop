// components/AuthWrapper.tsx

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStatus, useGetGuestToken } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import Preloader from "@/components/PageLoader/PreLoader";
import TokenStorage from "@/lib/tokenStorage";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  locale: string;
}

export default function AuthWrapper({
  children,
  requireAuth = false,
  redirectTo,
  locale,
}: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { mutate: getGuestToken, isPending: isGettingGuestToken } = useGetGuestToken();
  
  // Fetch user profile only if authenticated
  useUserProfile();

  // Initialize guest token if needed
  useEffect(() => {
    if (isLoading) return;

    if (!TokenStorage.hasAnyToken() && !isGettingGuestToken) {
      getGuestToken();
    }
  }, [isLoading, getGuestToken, isGettingGuestToken]);

  // Handle redirects
  useEffect(() => {
    if (isLoading || isGettingGuestToken) return;

    // Redirect to login if auth required but not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirect = redirectTo || `/${locale}/login`;
      const returnUrl = pathname !== redirect ? `?returnUrl=${encodeURIComponent(pathname)}` : "";
      router.push(`${redirect}${returnUrl}`);
      return;
    }

    if (isAuthenticated && (pathname.includes("/login") || pathname.includes("/register"))) {
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, router, locale, redirectTo, isGettingGuestToken]);

  if (isLoading || (requireAuth && !isAuthenticated)) {
    return <Preloader />;
  }

  return <>{children}</>;
}