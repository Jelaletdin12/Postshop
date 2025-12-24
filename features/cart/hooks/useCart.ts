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

const pendingUpdates = new Map<number, number>();
let updateLock = false;

class CartEventEmitter {
  private listeners: Set<() => void> = new Set();

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
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
    return {
      message: "error",
      data: [],
      errorDetails: "Server returned HTML instead of JSON.",
    };
  }

  if (typeof response === "object") {
    if (response.data) return response;
    return { message: "success", data: [] };
  }

  if (typeof response === "string") {
    try {
      return JSON.parse(response);
    } catch {
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
      const transformed = transformCartResponse(response.data);
      return transformed;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });

  useEffect(() => {
    const unsubscribe = cartEvents.subscribe(() => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "none",
      });
    });
    return () => {
      unsubscribe();
    };
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
          return JSON.parse(response.data);
        } catch {
          return { message: "success", data: "Added to cart" };
        }
      }

      return { message: "success", data: "Added to cart" };
    },
    onMutate: async ({ productId, quantity }) => {
      while (updateLock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      updateLock = true;

      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;

        let updated = { ...old, data: [...old.data] };

        pendingUpdates.forEach((pendingQty, pendingId) => {
          const idx = updated.data.findIndex(
            (item: any) => item.product?.id === pendingId
          );
          if (idx !== -1) {
            updated.data[idx] = {
              ...updated.data[idx],
              product_quantity: pendingQty,
            };
          }
        });

        const existingItem = updated.data.find(
          (item: any) => item.product?.id === productId
        );

        if (existingItem) {
          updated.data = updated.data.map((item: any) =>
            item.product?.id === productId
              ? {
                  ...item,
                  product_quantity: item.product_quantity + quantity,
                }
              : item
          );
        } else {
          updated.data = [
            ...updated.data,
            {
              product: { id: productId },
              product_quantity: quantity,
            } as any,
          ];
        }

        const finalItem = updated.data.find(
          (item: any) => item.product?.id === productId
        );
        if (finalItem) {
          pendingUpdates.set(productId, finalItem.product_quantity);
        }

        return updated;
      });

      cartEvents.emit();
      updateLock = false;

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        pendingUpdates.delete(variables.productId);
        cartEvents.emit();
      }
    },
    onSuccess: (data, variables) => {
      pendingUpdates.delete(variables.productId);
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "active",
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
        } catch {
          return [];
        }
      }

      return [];
    },
    onMutate: async (productId) => {
      while (updateLock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      updateLock = true;

      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;

        let updated = { ...old, data: [...old.data] };
        pendingUpdates.forEach((pendingQty, pendingId) => {
          if (pendingId !== productId) {
            const idx = updated.data.findIndex(
              (item: any) => item.product?.id === pendingId
            );
            if (idx !== -1) {
              updated.data[idx] = {
                ...updated.data[idx],
                product_quantity: pendingQty,
              };
            }
          }
        });

        updated.data = updated.data.filter(
          (item: any) => item.product?.id !== productId
        );

        pendingUpdates.delete(productId);
        return updated;
      });

      cartEvents.emit();
      updateLock = false;

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        cartEvents.emit();
      }
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
        } catch {
          return [];
        }
      }

      return [];
    },
    onMutate: async () => {
      while (updateLock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      updateLock = true;

      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;
        pendingUpdates.clear();
        return { ...old, data: [] };
      });

      cartEvents.emit();
      updateLock = false;

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
          return JSON.parse(response.data);
        } catch {
          return { message: "success", data: "Updated cart" };
        }
      }

      return { message: "success", data: "Updated cart" };
    },
    onMutate: async ({ productId, quantity }) => {
      while (updateLock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      updateLock = true;

      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      queryClient.setQueryData<CartResponse>(["cart"], (old) => {
        if (!old) return old;

        let updated = { ...old, data: [...old.data] };

        pendingUpdates.forEach((pendingQty, pendingId) => {
          const idx = updated.data.findIndex(
            (item: any) => item.product?.id === pendingId
          );
          if (idx !== -1) {
            updated.data[idx] = {
              ...updated.data[idx],
              product_quantity: pendingQty,
            };
          }
        });

        updated.data = updated.data.map((item: any) =>
          item.product?.id === productId
            ? { ...item, product_quantity: quantity }
            : item
        );

        pendingUpdates.set(productId, quantity);

        return updated;
      });

      cartEvents.emit();
      updateLock = false;

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        pendingUpdates.delete(variables.productId);
        cartEvents.emit();
      }
      throw error;
    },
    onSuccess: (data, variables) => {
      pendingUpdates.delete(variables.productId);
      queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "none",
      });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      customer_name?: string;
      customer_phone: number;
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
    onSuccess: (data) => {
      if (data && data.payment_url) {
        window.open(data.payment_url, '_blank')?.focus();
      }

      pendingUpdates.clear();
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

export function useCartCount() {
  const { data } = useCart();
  return (
    data?.data?.reduce(
      (sum: number, item: any) => sum + (item.product_quantity || 0),
      0
    ) || 0
  );
}
