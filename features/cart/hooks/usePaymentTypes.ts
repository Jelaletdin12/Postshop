import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

interface PaymentType {
  id: number
  name: string
}

interface PaymentTypesResponse {
  message: string
  data: PaymentType[]
}

export function usePaymentTypes() {
  return useQuery({
    queryKey: ["paymentTypes"],
    queryFn: async () => {
      const response = await apiClient.get<PaymentTypesResponse>("/order-payments")
      return response.data.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}