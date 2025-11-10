import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Product, PaginatedResponse } from "@/lib/types/api"

interface UseProductsOptions {
  enabled?: boolean
  staleTime?: number
  page?: number
  perPage?: number
}

export function useProducts(options?: UseProductsOptions) {
  return useQuery({
    queryKey: ["products", options?.page, options?.perPage],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
        params: {
          page: options?.page || 1,
          per_page: options?.perPage || 20,
        },
      })
      return response.data.data || response.data
    },
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

export function useProduct(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/products/${id}`)
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled !== false && !!id,
  })
}

export function useProductsBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/products/${slug}`)
      return response.data
    },
    enabled: options?.enabled !== false && !!slug,
  })
}
