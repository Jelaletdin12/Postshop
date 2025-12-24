// components/AuthWrapper.tsx

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { mutate: getGuestToken, isPending: isGettingGuestToken } =
    useGetGuestToken();

  useUserProfile();

  useEffect(() => {
    if (isLoading) return;

    if (!TokenStorage.hasAnyToken() && !isGettingGuestToken) {
      getGuestToken();
    }
  }, [isLoading, getGuestToken, isGettingGuestToken]);

  useEffect(() => {
    if (isLoading || isGettingGuestToken) return;
    if (requireAuth && !isAuthenticated) {
      router.push(`/${locale}`);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    router,
    locale,
    isGettingGuestToken,
  ]);
  if (isLoading || (requireAuth && !isAuthenticated)) {
    return <Preloader />;
  }

  return <>{children}</>;
}
