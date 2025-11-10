import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient, setAuthToken, clearAuthToken, setGuestToken } from "@/lib/api"
import { queryClient } from "@/lib/queryClient"

interface LoginCredentials {
  phone_number: string
  password?: string
}

interface RegisterData {
  phone_number: string
  name?: string
  email?: string
}

interface VerifyTokenData {
  phone_number: string
  code: string
}

interface AuthResponse {
  token?: string
  data?: string
  user?: any
}

/**
 * Guest Token alma (RTK mantığı)
 */
export function useGetGuestToken() {
  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/guest-token", {}, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.token || data?.data
      if (token) {
        setGuestToken(token)
      }
    },
    onError: (error) => {
      console.error("Error fetching guest token:", error)
    },
  })
}

/**
 * Login mutation (RTK mantığı)
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.token || data?.data
      if (token) {
        setAuthToken(token)
        apiClient.setAuthToken(token)
        
        // Tüm cache'i temizle ve yeniden fetch et
        queryClient.invalidateQueries()
      }
    },
    onError: (error) => {
      console.error("Login error:", error)
    },
  })
}

/**
 * Register mutation (RTK mantığı)
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/register", userData)
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.token || data?.data
      if (token) {
        setAuthToken(token)
        apiClient.setAuthToken(token)
        
        // Tüm cache'i temizle
        queryClient.invalidateQueries()
      }
    },
    onError: (error) => {
      console.error("Register error:", error)
    },
  })
}

/**
 * Token doğrulama (RTK mantığı)
 */
export function useVerifyToken() {
  return useMutation({
    mutationFn: async (verifyData: VerifyTokenData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/verify",
        verifyData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.data || data?.token
      if (token) {
        setAuthToken(token)
        apiClient.setAuthToken(token)
        
        // Tüm cache'i temizle
        queryClient.invalidateQueries()
      }
    },
    onError: (error) => {
      console.error("Error verifying token:", error)
    },
  })
}

/**
 * Logout işlemi
 */
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // Backend'e logout isteği gönder (eğer endpoint varsa)
      try {
        await apiClient.post("/auth/logout")
      } catch (error) {
        // Logout endpoint yoksa da devam et
        console.warn("Logout endpoint not available")
      }
    },
    onSuccess: () => {
      clearAuthToken()
      apiClient.clearAuthToken()
      
      // Tüm cache'i temizle
      queryClient.clear()
      
      // Login sayfasına yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    },
  })
}

/**
 * Kullanıcı bilgilerini getir
 */
export function useUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me")
      return response.data
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 dakika
    retry: false,
  })
}

/**
 * Authentication durumunu kontrol et
 */
export function useAuthStatus() {
  const { data: user, isLoading, error } = useUser({ enabled: true })
  
  return {
    isAuthenticated: !!user && !error,
    isLoading,
    user,
  }
}