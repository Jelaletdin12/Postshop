"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config/api-endpoints"
import type { UserProfile } from "@/lib/types/api"

export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.profile)
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled !== false,
  })
}
