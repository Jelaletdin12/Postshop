import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Carousel, Banner, PaginatedResponse } from "@/lib/types/api"

// Get all carousels
export function useCarousels(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["carousels"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Carousel>>("/media/carousels")
      return response.data.data || response.data
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Get all banners
export function useBanners(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Banner>>("/media/banners")
      return response.data.data || response.data
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}