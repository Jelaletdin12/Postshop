import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Collection, Product, PaginatedResponse } from "@/lib/types/api"

// Get all collections
export function useCollections(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Collection>>("/collections")
      return response.data.data || response.data
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Get single collection by ID
export function useCollection(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const response = await apiClient.get<Collection>(`/collections/${id}`)
      return response.data
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 15,
  })
}

// Get collection products (non-paginated)
export function useCollectionProducts(
  collectionId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection", collectionId, "products"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`
      )
      const data = response.data.data || []
      return {
        data,
        isEmpty: data.length === 0,
      }
    },
    enabled: options?.enabled !== false && !!collectionId,
  })
}

// Check if collection has products (limit=1 for efficiency)
export function useCollectionHasProducts(
  collectionId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection", collectionId, "has-products"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`,
        {
          params: { limit: 1 },
        }
      )
      return {
        hasProducts: response.data.data && response.data.data.length > 0,
      }
    },
    enabled: options?.enabled !== false && !!collectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get collection products with pagination
export function useCollectionProductsPaginated(
  collectionId: number | string,
  options?: {
    enabled?: boolean
    page?: number
    limit?: number
  }
) {
  const page = options?.page || 1
  const limit = options?.limit || 6

  return useQuery({
    queryKey: ["collection", collectionId, "products-paginated", page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`,
        {
          params: {
            page,
            limit,
          },
        }
      )
      const data = response.data.data || []
      return {
        data,
        pagination: response.data.pagination || {},
        isEmpty: data.length === 0,
      }
    },
    enabled: options?.enabled !== false && !!collectionId,
  })
}