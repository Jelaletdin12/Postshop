import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { CartItem } from "@/lib/types/api"

interface CartResponse {
  message: string
  data: CartItem[]
  errorDetails?: string
}

// Transform response to handle HTML/malformed responses
function transformCartResponse(response: any): CartResponse {
  if (
    typeof response === "string" &&
    (response.trim().startsWith("<!DOCTYPE") || response.trim().startsWith("<html"))
  ) {
    console.error("Received HTML response instead of JSON:", response.substring(0, 100))
    return {
      message: "error",
      data: [],
      errorDetails: "Server returned HTML instead of JSON. The server might be down or experiencing issues.",
    }
  }

  if (typeof response === "object") {
    if (response.data) {
      return response
    }
    return { message: "success", data: [] }
  }

  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Failed to parse response:", error)
      return { message: "error", data: [] }
    }
  }

  return { message: "unknown", data: [] }
}

export function useCart(options?: Partial<UseQueryOptions<CartResponse>>) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await apiClient.get("/carts")
      return transformCartResponse(response.data)
    },
    refetchInterval: 10000, // Increased to 10 seconds (less aggressive)
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Enable to catch updates on tab focus
    refetchOnReconnect: true,
    staleTime: 5000, // Data considered fresh for 5 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const params = new URLSearchParams({
        product_id: String(productId),
        product_quantity: String(quantity),
      })

      const response = await apiClient.post("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (typeof response.data === "object" && response.data.data) {
        return response.data
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data)
          return parsed
        } catch (error) {
          console.error("Failed to parse add to cart response:", error)
          return { message: "success", data: "Added to cart" }
        }
      }

      return { message: "success", data: "Added to cart" }
    },
    onSuccess: () => {
      // Invalidate but don't refetch immediately (let polling handle it)
      queryClient.invalidateQueries({ queryKey: ["cart"], refetchType: 'none' })
    },
    onError: (error: any) => {
      console.error("Add to cart error:", error.response?.data?.message || error.message)
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number) => {
      const params = new URLSearchParams({ product_id: String(productId) })

      const response = await apiClient.patch("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (typeof response.data === "object" && response.data.data) {
        return response.data.data
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data)
          return parsed.data || []
        } catch (error) {
          console.error("Failed to parse cart response:", error)
          return []
        }
      }

      return []
    },
    onSuccess: () => {
      // Immediate refetch after removal
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (error: any) => {
      console.error("Remove from cart error:", error.response?.data?.message || error.message)
    },
  })
}

export function useCleanCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/carts", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (typeof response.data === "object" && response.data.data) {
        return response.data.data
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data)
          return parsed.data || []
        } catch (error) {
          console.error("Failed to parse cart response:", error)
          return []
        }
      }

      return []
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const params = new URLSearchParams({
        product_id: String(productId),
        product_quantity: String(quantity),
      })

      const response = await apiClient.post("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000, // 15 second timeout
      })

      if (typeof response.data === "object" && response.data.data) {
        return response.data
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data)
          return parsed
        } catch (error) {
          console.error("Failed to parse update cart response:", error)
          return { message: "success", data: "Updated cart" }
        }
      }

      return { message: "success", data: "Updated cart" }
    },
    onSuccess: () => {
      // Invalidate but don't refetch immediately (let optimistic update handle it)
      queryClient.invalidateQueries({ queryKey: ["cart"], refetchType: 'none' })
    },
    onError: (error: any) => {
      console.error("API update failed:", error.response?.data?.message || error.message)
      throw error // Re-throw to trigger retry mechanism
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
      const response = await apiClient.post("/orders", payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (error: any) => {
      console.error("Create order error:", error.response?.data?.message || error.message)
    },
  })
}