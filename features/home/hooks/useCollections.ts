import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Collection, Product, PaginatedResponse } from "@/lib/types/api";

// Get ALL collections (fetch all pages)
export function useCollections(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const allCollections: Collection[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await apiClient.get<PaginatedResponse<Collection>>(
          "/collections",
          { params: { page: currentPage, perPage: 50 } }
        );

        const collections = response.data.data || [];
        allCollections.push(...collections);

        // Check if there are more pages
        const pagination = response.data.pagination;
        if (pagination && pagination.next_page_url) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      return allCollections;
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

// Get ALL products for a collection (fetch all pages)
export function useCollectionProducts(
  collectionId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collection", collectionId, "products"],
    queryFn: async () => {
      const allProducts: Product[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await apiClient.get<PaginatedResponse<Product>>(
          `/collections/${collectionId}/products`,
          { params: { page: currentPage, perPage: 50 } }
        );

        const products = response.data.data || [];
        allProducts.push(...products);

        // Check if there are more pages
        const pagination = response.data.pagination;
        if (pagination && pagination.next_page_url) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      return {
        data: allProducts,
        isEmpty: allProducts.length === 0,
      };
    },
    enabled: options?.enabled !== false && !!collectionId,
  });
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
        { params: { perPage: 1 } }
      );
      return {
        hasProducts: response.data.data && response.data.data.length > 0,
      };
    },
    enabled: options?.enabled !== false && !!collectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get collection products with infinite scroll (recommended for UI)
export function useCollectionProductsInfinite(
  collectionId: number | string,
  options?: { enabled?: boolean; perPage?: number }
) {
  const perPage = options?.perPage || 6;

  return useInfiniteQuery({
    queryKey: ["collection", collectionId, "products-infinite", perPage],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/collections/${collectionId}/products`,
        {
          params: {
            page: pageParam,
            perPage,
          },
        }
      );
      return {
        data: response.data.data || [],
        pagination: response.data.pagination,
        isEmpty: !response.data.data || response.data.data.length === 0,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.next_page_url) {
        // Extract page number from URL or increment
        const currentPage = lastPage.pagination.page || 1;
        return currentPage + 1;
      }
      return undefined;
    },
    enabled: options?.enabled !== false && !!collectionId,
    initialPageParam: 1,
  });
}
