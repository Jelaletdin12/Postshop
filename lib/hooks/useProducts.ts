import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Review, Product, PaginatedResponse } from "@/lib/types/api";

// Get single review by ID
export function useReview(
  reviewId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["review", reviewId],
    queryFn: async () => {
      const response = await apiClient.get<Review>(`/reviews/${reviewId}`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!reviewId,
    staleTime: 1000 * 60 * 10,
  });
}

// Get all reviews with pagination
export function useReviews(options?: {
  enabled?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["reviews", options?.page, options?.limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Review>>(
        `/reviews`,
        {
          params: {
            page: options?.page || 1,
            limit: options?.limit,
          },
        }
      );
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });
}

// Get related reviews for a review
export function useRelatedReviews(
  reviewId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["review", reviewId, "related"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Review>>(
        `/reviews/${reviewId}/related`
      );
      return response.data.data || response.data;
    },
    enabled: options?.enabled !== false && !!reviewId,
    staleTime: 1000 * 60 * 15,
  });
}

export function useProducts(options?: UseProductsOptions) {
  return useQuery({
    queryKey: ["products", options?.page, options?.perPage],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        "/products",
        {
          params: {
            page: options?.page || 1,
            per_page: options?.perPage || 20,
          },
        }
      );
      return response.data.data || response.data;
    },
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    enabled: options?.enabled !== false,
  });
}

// Get single product by ID (for review context)
export function useProduct(
  productId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/products/${productId}`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!productId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProductsBySlug(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${slug}`);
      // API returns { message: "success", data: {...} }
      return response.data.data || response.data;
    },
    enabled: options?.enabled !== false && !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

// Submit review mutation
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      title,
      source,
    }: {
      productId: number | string;
      rating: number;
      title: string;
      source: string;
    }) => {
      const response = await apiClient.post<Review>(
        `/products/${productId}/reviews`,
        { rating, title, source },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
  });
}

// Update review mutation
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      title,
      source,
    }: {
      reviewId: number | string;
      rating?: number;
      title?: string;
      source?: string;
    }) => {
      const response = await apiClient.put<Review>(
        `/reviews/${reviewId}`,
        { rating, title, source },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["review", variables.reviewId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
  });
}

// Delete review mutation
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number | string) => {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    },
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({
        queryKey: ["review", reviewId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
  });
}
