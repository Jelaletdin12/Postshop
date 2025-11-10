import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Favorite } from "@/lib/types/api"

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await apiClient.get<Favorite[]>("/favorites")
      return response.data
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useAddToFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiClient.post<Favorite[]>("/favorites", { product_id: productId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number) => {
      await apiClient.delete(`/favorites/${productId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}
