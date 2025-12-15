import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CartItem } from "@/lib/types/api";
import { useEffect } from "react";

interface CartResponse {
  message: string;
  data: CartItem[];
  errorDetails?: string;
}

// Event emitter for cross-component cart updates
class CartEventEmitter {
  private listeners: Set<() => void> = new Set();

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit() {
    this.listeners.forEach((cb) => cb());
  }
}

export const cartEvents = new CartEventEmitter();

function transformCartResponse(response: any): CartResponse {
  if (
    typeof response === "string" &&
    (response.trim().startsWith("<!DOCTYPE") ||
      response.trim().startsWith("<html"))
  ) {
    console.error(
      "Received HTML response instead of JSON:",
      response.substring(0, 100)
    );
    return {
      message: "error",
      data: [],
      errorDetails:
        "Server returned HTML instead of JSON. The server might be down or experiencing issues.",
    };
  }

  if (typeof response === "object") {
    if (response.data) {
      return response;
    }
    return { message: "success", data: [] };
  }

  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error("Failed to parse response:", error);
      return { message: "error", data: [] };
    }
  }

  return { message: "unknown", data: [] };
}

export function useCart(options?: Partial<UseQueryOptions<CartResponse>>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await apiClient.get("/carts");
      return transformCartResponse(response.data);
    },
    // REMOVED: Aggressive polling
    // ADDED: Smart refetching only when needed
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnReconnect: true, // Only refetch on reconnect
    staleTime: Infinity, // Data never goes stale automatically
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });

  // Subscribe to cart events for cross-component updates
  useEffect(() => {
    const unsubscribe = cartEvents.subscribe(() => {
      // Only update cache, don't refetch
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "none",
      });
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: number;
      quantity?: number;
    }) => {
      const params = new URLSearchParams({
        product_id: String(productId),
        product_quantity: String(quantity),
      });

      const response = await apiClient.post("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (typeof response.data === "object" && response.data.data) {
        return response.data;
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          return parsed;
        } catch (error) {
          console.error("Failed to parse add to cart response:", error);
          return { message: "success", data: "Added to cart" };
        }
      }

      return { message: "success", data: "Added to cart" };
    },
    onMutate: async ({ productId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      // Optimistically update cart
      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;

        const existingItem = old.data.find(
          (item: any) => item.product?.id === productId
        );

        if (existingItem) {
          // Update existing item quantity
          return {
            ...old,
            data: old.data.map((item: any) =>
              item.product?.id === productId
                ? {
                    ...item,
                    product_quantity: item.product_quantity + quantity,
                  }
                : item
            ),
          };
        } else {
          // Add new item (we don't have full product data, so we add placeholder)
          return {
            ...old,
            data: [
              ...old.data,
              {
                product: { id: productId },
                product_quantity: quantity,
              } as any,
            ],
          };
        }
      });

      // Notify other components
      cartEvents.emit();

      return { previousCart };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        cartEvents.emit();
      }
      console.error("Add to cart error:", error);
    },
    onSuccess: () => {
      // Silently refetch in background to sync with server
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "active", // Only refetch if actively being watched
      });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const params = new URLSearchParams({ product_id: String(productId) });

      const response = await apiClient.patch("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (typeof response.data === "object" && response.data.data) {
        return response.data.data;
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          return parsed.data || [];
        } catch (error) {
          console.error("Failed to parse cart response:", error);
          return [];
        }
      }

      return [];
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((item: any) => item.product?.id !== productId),
        };
      });

      cartEvents.emit();

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        cartEvents.emit();
      }
      console.error("Remove from cart error:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "active",
      });
    },
  });
}

export function useCleanCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/carts", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (typeof response.data === "object" && response.data.data) {
        return response.data.data;
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          return parsed.data || [];
        } catch (error) {
          console.error("Failed to parse cart response:", error);
          return [];
        }
      }

      return [];
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;
        return { ...old, data: [] };
      });

      cartEvents.emit();

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        cartEvents.emit();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      const params = new URLSearchParams({
        product_id: String(productId),
        product_quantity: String(quantity),
      });

      const response = await apiClient.post("/carts", params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      });

      if (typeof response.data === "object" && response.data.data) {
        return response.data;
      }

      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          return parsed;
        } catch (error) {
          console.error("Failed to parse update cart response:", error);
          return { message: "success", data: "Updated cart" };
        }
      }

      return { message: "success", data: "Updated cart" };
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.product?.id === productId
              ? { ...item, product_quantity: quantity }
              : item
          ),
        };
      });

      cartEvents.emit();

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        cartEvents.emit();
      }
      console.error("API update failed:", error);
      throw error;
    },
    onSuccess: () => {
      // Background sync
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "none", // Don't refetch, trust optimistic update
      });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      customer_name?: string;
      customer_phone: string;
      customer_address: string;
      shipping_method: string;
      payment_type_id: number;
      delivery_time?: string;
      delivery_at?: string;
      region: string;
      note?: string;
    }) => {
      const response = await apiClient.post("/orders", payload);
      return response.data;
    },
    onSuccess: () => {
      // Clear cart after successful order
      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;
        return { ...old, data: [] };
      });
      cartEvents.emit();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      console.error(
        "Create order error:",
        error.response?.data?.message || error.message
      );
    },
  });
}

// Hook to get cart count for badges
export function useCartCount() {
  const { data } = useCart();
  return (
    data?.data?.reduce(
      (sum: number, item: any) => sum + (item.product_quantity || 0),
      0
    ) || 0
  );
}
