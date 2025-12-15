import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  Collection,
  Product,
  PaginatedResponse,
  FiltersResponse,
  ProductFilters,
} from "@/lib/types/api";

// Get all collections
export function useCollections(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Collection>>(
        "/collections"
      );
      return response.data.data || response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Get single collection by ID
export function useCollection(
  id: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const response = await apiClient.get<Collection>(`/collections/${id}`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 15,
  });
}

// Get products for a collection with pagination
export function useCollectionProducts(
  collectionId: number | string,
  options?: {
    enabled?: boolean;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: [
      "collection",
      collectionId,
      "products",
      options?.page,
      options?.limit,
    ],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`,
        {
          params: {
            page: options?.page || 1,
            per_page: options?.limit,
          },
        }
      );
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    },
    enabled: options?.enabled !== false && !!collectionId,
  });
}

// Get filters for collection products
export function useCollectionFilters(
  collectionId: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection-filters", collectionId],
    queryFn: async () => {
      const response = await apiClient.get<FiltersResponse>("/filters", {
        params: { collection_id: collectionId },
      });
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!collectionId,
    staleTime: 1000 * 60 * 15,
  });
}

// Get filtered collection products
export function useFilteredCollectionProducts(
  collectionId: number | string,
  filters: ProductFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection", collectionId, "filtered-products", filters],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: filters.page || 1,
        per_page: filters.limit || 6,
      };

      if (filters.brands && filters.brands.length > 0) {
        params.brands = filters.brands.join(",");
      }

      if (filters.categories && filters.categories.length > 0) {
        params.categories = filters.categories.join(",");
      }

      if (filters.min_price !== undefined) {
        params.min_price = filters.min_price;
      }

      if (filters.max_price !== undefined) {
        params.max_price = filters.max_price;
      }

      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`,
        { params }
      );

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    },
    enabled: options?.enabled !== false && !!collectionId,
  });
}

// Check if collection has products
export function useCheckCollectionHasProducts(
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
      );
      return {
        hasProducts: response.data.data && response.data.data.length > 0,
      };
    },
    enabled: options?.enabled !== false && !!collectionId,
    staleTime: 1000 * 60 * 5,
  });
}