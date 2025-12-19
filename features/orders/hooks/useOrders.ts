import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Order, OrdersResponse } from "@/lib/types/api";

export function useOrders(options?: { page?: number; perPage?: number }) {
  return useQuery<Order[]>({
    queryKey: ["orders", options?.page],
    queryFn: async () => {
      const response = await apiClient.get<OrdersResponse>("/orders", {
        params: {
          page: options?.page || 1,
          per_page: options?.perPage || 20,
        },
      });
      
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useOrder(id: number | string) {
  return useQuery<Order | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// export function useCreateOrder() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (orderData: CreateOrderRequest) => {
//       const formData = new URLSearchParams();

//       Object.entries(orderData).forEach(([key, value]) => {
//         if (value !== null && value !== undefined) {
//           formData.append(key, String(value));
//         }
//       });

//       const response = await apiClient.post("/orders", formData, {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       });

//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["orders"] });
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//     },
//   });
// }

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.delete(`/orders/${orderId}`);
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}