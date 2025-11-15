"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStatus, useGetGuestToken } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";

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
  
  // Login olmuş kullanıcı için profil bilgisini otomatik çek
  useUserProfile();

  useEffect(() => {
    if (isLoading) return;

    const authToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("authToken="));
    const guestToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("guestToken="));
    
    if (!authToken && !guestToken && !isGettingGuestToken) {
      getGuestToken();
    }
  }, [isLoading, getGuestToken, isGettingGuestToken]);

  useEffect(() => {
    if (isLoading || isGettingGuestToken) return;

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}