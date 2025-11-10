import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Address } from "@/lib/types/api"

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await apiClient.get<Address[]>("/api/v1/addresses")
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
