import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

interface Province {
  id: number
  region: string
  name: string
}

interface ProvincesResponse {
  message: string
  data: Province[]
}

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await apiClient.get<ProvincesResponse>("/provinces")
      return response.data.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

