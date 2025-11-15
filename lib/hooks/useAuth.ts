import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiClient, setAuthToken, clearAuthToken, setGuestToken } from "@/lib/api";

// ==================== TYPES ====================
interface LoginCredentials {
  phone_number: string;
  password?: string;
}

interface RegisterData {
  phone_number: string;
  name?: string;
  email?: string;
}

interface VerifyTokenData {
  phone_number: string;
  code: string;
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

// ==================== AUTH STATUS ====================
const getTokenFromCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export function useAuthStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authToken = getTokenFromCookie("authToken");
    setIsAuthenticated(!!authToken);
    setIsLoading(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
  };
}

// ==================== GUEST TOKEN ====================
export function useGetGuestToken() {
  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/guest-token", {});
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.token || data?.data;
      if (token) {
        setGuestToken(token);
      }
    },
    onError: (error) => {
      console.error("Guest token hatası:", error);
    },
  });
}

// ==================== LOGIN ====================
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    },
    onError: (error) => {
      console.error("Login hatası:", error);
    },
  });
}

// ==================== REGISTER ====================
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.token || data?.data;
      if (token) {
        setAuthToken(token);
        queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      }
    },
    onError: (error) => {
      console.error("Register hatası:", error);
    },
  });
}

// ==================== VERIFY TOKEN ====================
export function useVerifyToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verifyData: VerifyTokenData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/verify", verifyData);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.data || data?.token;
      if (token) {
        setAuthToken(token);
        queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      }
    },
    onError: (error) => {
      console.error("Verify hatası:", error);
    },
  });
}

// ==================== LOGOUT ====================
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        console.warn("Logout endpoint çalışmadı:", error);
      }
    },
    onSuccess: () => {
      clearAuthToken();
      queryClient.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
    onError: (error) => {
      console.error("Logout hatası:", error);
      clearAuthToken();
      queryClient.clear();
    },
  });
}