import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Order, PaginatedResponse } from "@/lib/types/api";

// Response tiplerini tanımlayalım
interface OrderResponse {
  data?: Order | Order[];
  [key: string]: any;
}

interface OrderActionResponse {
  data?: string | Order;
  [key: string]: any;
}

// Response'u transform eden yardımcı fonksiyonlar
function transformOrdersResponse(response: any): Order[] {
  if (typeof response === "object" && response.data) {
    return Array.isArray(response.data) ? response.data : [];
  }
  return [];
}

function transformOrderResponse(response: any): Order | null {
  if (typeof response === "object" && response.data) {
    return response.data;
  }
  return null;
}

function transformOrderActionResponse(
  response: any,
  defaultValue: string
): string | Order {
  if (response && response.data) {
    return response.data;
  }
  return defaultValue;
}

function isHtmlResponse(response: any): boolean {
  return typeof response === "string" && response.includes("<!doctype html>");
}

// Orders list query
export function useOrders(options?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["orders", options?.page],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          page: options?.page || 1,
          per_page: options?.perPage || 20,
        },
      });
      return transformOrdersResponse(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// Single order query
export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return transformOrderResponse(response.data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// Order times query
export function useOrderTimes() {
  return useQuery({
    queryKey: ["order-times"],
    queryFn: async () => {
      const response = await apiClient.get("/order-time");
      return transformOrdersResponse(response.data);
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

// Order payments query
export function useOrderPayments() {
  return useQuery({
    queryKey: ["order-payments"],
    queryFn: async () => {
      const response = await apiClient.get("/order-payments");
      return transformOrdersResponse(response.data);
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

// Create/Place order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Record<string, any>) => {
      try {
        const formData = new URLSearchParams();

        // Convert orderData to URLSearchParams
        Object.entries(orderData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        const response = await apiClient.post("/orders", formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: (status) => status >= 200 && status < 300,
        });

        // Check for HTML response
        if (isHtmlResponse(response.data)) {
          throw new Error(
            "Server returned HTML instead of expected response format"
          );
        }

        return transformOrderActionResponse(response.data, "Order placed");
      } catch (error: any) {
        // Handle HTML error response
        if (error.response && isHtmlResponse(error.response.data)) {
          throw new Error(
            "Server returned HTML instead of expected response format"
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.delete(`/orders/${orderId}`);
      return transformOrderActionResponse(response.data, "Order cancelled");
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
