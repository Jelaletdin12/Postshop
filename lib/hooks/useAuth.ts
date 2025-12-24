// lib/hooks/useAuth.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import TokenStorage from "@/lib/tokenStorage";
import { AxiosError } from "axios";

// ==================== TYPES ====================
interface LoginCredentials {
  phone_number: number;
  password?: string;
}

interface RegisterData {
  phone_number: string;
  name?: string;
  email?: string;
}

interface VerifyTokenData {
  phone_number: number;
  code: number;
}

interface AuthResponse {
  token?: string;
  data?: string;
  user?: {
    id: string;
    phone_number: string;
    name?: string;
    email?: string;
  };
}

interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ==================== UTILITIES ====================
function extractToken(data: AuthResponse): string {
  // Enforce consistent token extraction
  const token = data.token || data.data;
  if (!token) {
    throw new Error("No token received from server");
  }
  return token;
}

function handleAuthError(error: unknown): AuthError {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return {
        message: "Request timeout - server not responding",
        code: "TIMEOUT",
        statusCode: 408
      };
    }
    if (error.response) {
      return {
        message: error.response.data?.message || "Authentication failed",
        code: error.response.data?.code || "AUTH_ERROR",
        statusCode: error.response.status
      };
    }
    if (error.request) {
      return {
        message: "Network error - cannot reach server",
        code: "NETWORK_ERROR",
        statusCode: 0
      };
    }
  }
  return {
    message: error instanceof Error ? error.message : "Unknown error occurred",
    code: "UNKNOWN_ERROR"
  };
}

// ==================== AUTH STATUS ====================
export function useAuthStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(TokenStorage.hasAuthToken());
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
}

// ==================== GUEST TOKEN ====================
export function useGetGuestToken() {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await apiClient.post<AuthResponse>(
          "/auth/guest-token",
          {},
          {
            signal: controller.signal,
            timeout: 10000
          }
        );
        clearTimeout(timeoutId);
        return extractToken(response.data);
      } catch (error) {
        clearTimeout(timeoutId);
        throw handleAuthError(error);
      }
    },
    onSuccess: (token) => {
      TokenStorage.setGuestToken(token);
    },
    onError: (error: AuthError) => {
      console.error("[Guest Token] Failed:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    },
    retry: (failureCount, error) => {
      const authError = error as AuthError;
      // Retry on network errors, not on auth errors
      if (authError.code === "NETWORK_ERROR" || authError.code === "TIMEOUT") {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

// ==================== LOGIN ====================
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<string> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
        { timeout: 15000 }
      );
      return extractToken(response.data);
    },
    onSuccess: (token) => {
      TokenStorage.setAuthToken(token);
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      const authError = handleAuthError(error);
      console.error("[Login] Failed:", authError);
    },
  });
}

// ==================== REGISTER ====================
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<string> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        userData,
        { timeout: 15000 }
      );
      return extractToken(response.data);
    },
    onSuccess: (token) => {
      TokenStorage.setAuthToken(token);
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      const authError = handleAuthError(error);
      console.error("[Register] Failed:", authError);
    },
  });
}

// ==================== VERIFY TOKEN ====================
export function useVerifyToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verifyData: VerifyTokenData): Promise<string> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/verify",
        verifyData,
        { timeout: 15000 }
      );
      return extractToken(response.data);
    },
    onSuccess: (token) => {
      TokenStorage.setAuthToken(token);
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      const authError = handleAuthError(error);
      console.error("[Verify] Failed:", authError);
    },
  });
}

// ==================== LOGOUT ====================
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post("/auth/logout", {}, { timeout: 5000 });
      } catch (error) {
        // Logout should succeed even if server call fails
        console.warn("[Logout] Server call failed, clearing local state anyway");
      }
    },
    onSuccess: () => {
      TokenStorage.clearTokens();
      queryClient.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
    onError: () => {
      TokenStorage.clearTokens();
      queryClient.clear();
      
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });
}