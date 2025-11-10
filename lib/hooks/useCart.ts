import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Cart, CartItem } from "@/lib/types/api"

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await apiClient.get<Cart>("/api/v1/carts")
      return response.data
    },
    staleTime: 0, // Always fetch fresh
    retry: 1,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await apiClient.post<Cart>("/api/v1/carts", {
        product_id: productId,
        quantity,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error: any) => {
      console.error("[v0] Add to cart error:", error.response?.data?.message || error.message)
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: number) => {
      await apiClient.delete(`/api/v1/carts/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await apiClient.patch<CartItem>(`/api/v1/carts/${itemId}`, {
        quantity,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      customer_name?: string
      customer_phone?: string
      customer_address: string
      shipping_method: string
      payment_type_id: number
      delivery_time?: string
      delivery_at?: string
      region: string
      note?: string
    }) => {
      const response = await apiClient.post("/api/v1/orders", payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (error: any) => {
      console.error("[v0] Create order error:", error.response?.data?.message || error.message)
    },
  })
}
