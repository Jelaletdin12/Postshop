import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Region } from "@/lib/types/api"

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await apiClient.get<Region[]>("/api/v1/regions")
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
