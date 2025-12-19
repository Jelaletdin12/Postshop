import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Review, Product, PaginatedResponse } from "@/lib/types/api";

// Types
interface PaginationOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
}

interface ReviewSubmission {
  productId: number | string;
  rating: number;
  title: string;
  source?: string;
}

interface ReviewUpdate {
  reviewId: number | string;
  rating?: number;
  title?: string;
  source?: string;
}

// Constants
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const EXTENDED_STALE_TIME = 1000 * 60 * 15; // 15 minutes

// Query Keys Factory
const reviewKeys = {
  all: ["reviews"],
  lists: () => [...reviewKeys.all, "list"],
  list: (page?: number, limit?: number) => [...reviewKeys.lists(), page, limit],
  details: () => [...reviewKeys.all, "detail"],
  detail: (id: number | string) => [...reviewKeys.details(), id],
  related: (id: number | string) => [...reviewKeys.detail(id), "related"],
  byProduct: (productId: number | string, page?: number, limit?: number) => [
    ...reviewKeys.all,
    "product",
    productId,
    page,
    limit,
  ],
};

const productKeys = {
  all: ["products"],
  details: () => [...productKeys.all, "detail"],
  detail: (id: number | string) => [...productKeys.details(), id],
  bySlug: (slug: string) => [...productKeys.all, "slug", slug],
  related: (id: number | string) => [...productKeys.detail(id), "related"],
};

// Generic fetch function
async function fetchData<T>(
  url: string,
  params?: Record<string, any>
): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

// Review Queries
export function useReview(
  reviewId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => fetchData<Review>(`/reviews/${reviewId}`),
    enabled: options?.enabled !== false && !!reviewId,
    staleTime: DEFAULT_STALE_TIME * 2,
  });
}

export function useReviews(options?: PaginationOptions) {
  return useQuery({
    queryKey: reviewKeys.list(options?.page, options?.limit),
    queryFn: async () => {
      const response = await fetchData<PaginatedResponse<Review>>("/reviews", {
        page: options?.page || 1,
        limit: options?.limit,
      });
      return {
        data: response.data || [],
        pagination: response.pagination || {},
      };
    },
    enabled: options?.enabled !== false,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRelatedReviews(
  reviewId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.related(reviewId),
    queryFn: async () => {
      const response = await fetchData<PaginatedResponse<Review>>(
        `/reviews/${reviewId}/related`
      );
      return response.data || response;
    },
    enabled: options?.enabled !== false && !!reviewId,
    staleTime: EXTENDED_STALE_TIME,
  });
}

export function useProductReviews(
  productId: number | string,
  options?: PaginationOptions
) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId, options?.page, options?.limit),
    queryFn: async () => {
      const response = await fetchData<PaginatedResponse<Review>>(
        `/products/${productId}/reviews`,
        {
          page: options?.page || 1,
          limit: options?.limit || 10,
        }
      );
      return {
        data: response.data || [],
        pagination: response.pagination || {},
      };
    },
    enabled: options?.enabled !== false && !!productId,
    staleTime: DEFAULT_STALE_TIME,
  });
}

// Product Queries
export function useProduct(
  productId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchData<Product>(`/products/${productId}`),
    enabled: options?.enabled !== false && !!productId,
    staleTime: DEFAULT_STALE_TIME * 2,
  });
}

export function useProductsBySlug(
  slug: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: async () => {
      const response = await fetchData<{ data: Product }>(`/products/${slug}`);
      return response.data || response;
    },
    enabled: options?.enabled !== false && !!slug,
    staleTime: DEFAULT_STALE_TIME * 2,
  });
}

export function useRelatedProducts(
  productId: number | string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: async () => {
      const response = await fetchData<PaginatedResponse<Product>>(
        `/products/${productId}/related`
      );
      return response.data || [];
    },
    enabled: options?.enabled !== false && !!productId,
    staleTime: EXTENDED_STALE_TIME,
  });
}

// Review Mutations
function useReviewMutation<TVariables, TData = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: (variables: TVariables, data?: TData) => any[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      const keys = invalidateKeys(variables, data);
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useSubmitReview() {
  return useReviewMutation<ReviewSubmission>(
    async ({ productId, rating, title, source = "site" }) => {
      const response = await apiClient.post<{
        message: string;
        data: Review[];
      }>(`/products/${productId}/reviews`, { rating, title, source });
      return response.data;
    },
    (variables) => [
      reviewKeys.byProduct(variables.productId),
      productKeys.bySlug(""), 
      reviewKeys.all,
    ]
  );
}

export function useUpdateReview() {
  return useReviewMutation<ReviewUpdate>(
    async ({ reviewId, rating, title, source }) => {
      const response = await apiClient.put<Review>(
        `/reviews/${reviewId}`,
        { rating, title, source },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    },
    (variables) => [reviewKeys.detail(variables.reviewId), reviewKeys.all]
  );
}

export function useDeleteReview() {
  return useReviewMutation<number | string>(
    (reviewId) =>
      apiClient.delete(`/reviews/${reviewId}`).then((res) => res.data),
    (reviewId) => [reviewKeys.detail(reviewId), reviewKeys.all]
  );
}
