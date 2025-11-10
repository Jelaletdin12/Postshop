import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Order, PaginatedResponse } from "@/lib/types/api"

export function useOrders(options?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["orders", options?.page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Order>>("/orders", {
        params: {
          page: options?.page || 1,
          per_page: options?.perPage || 20,
        },
      })
      return response.data.data || response.data
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/orders/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number) => {
      await apiClient.post(`/orders/${orderId}/cancel`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiClient.post<Order>("/orders", orderData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
