import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { PaymentTypeOption } from "@/lib/types/api"

export function usePaymentTypes() {
  return useQuery({
    queryKey: ["paymentTypes"],
    queryFn: async () => {
      const response = await apiClient.get<PaymentTypeOption[]>("/api/v1/order-payments")
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
