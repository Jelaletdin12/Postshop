import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Category, Product, PaginatedResponse } from "@/lib/types/api"

// Get all categories as tree
export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Category>>("/categories", {
        params: { type: "tree" },
      })
      return response.data.data || response.data
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Get single category by ID
export function useCategory(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await apiClient.get<Category>(`/categories/${id}`)
      return response.data
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 15,
  })
}

// Get products for a single category with pagination
export function useCategoryProducts(
  categoryId: number | string, 
  options?: { 
    enabled?: boolean
    page?: number
    limit?: number
  }
) {
  return useQuery({
    queryKey: ["category", categoryId, "products", options?.page, options?.limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/categories/${categoryId}/products`, 
        {
          params: { 
            page: options?.page || 1,
            limit: options?.limit 
          },
        }
      )
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      }
    },
    enabled: options?.enabled !== false && !!categoryId,
  })
}

// Get ALL products from category and its children - NO pagination (for initial load)
export function useAllCategoryProducts(
  category: Category | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["category", category?.id, "all-products"],
    queryFn: async () => {
      if (!category) return []

      const fetchProducts = async (categoryId: number) => {
        const response = await apiClient.get<PaginatedResponse<Product>>(
          `/categories/${categoryId}/products`
        )
        return response.data.data || []
      }

      let allProducts = await fetchProducts(category.id)

      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          const childProducts = await fetchProducts(child.id)
          allProducts = [...allProducts, ...childProducts]
        }
      }

      return allProducts
    },
    enabled: options?.enabled !== false && !!category,
  })
}

// Get products from category and children WITH pagination (mimics RTK getAllCategoryProductsPaginated)
export function useAllCategoryProductsPaginated(
  category: Category | undefined,
  options?: { 
    enabled?: boolean
    page?: number
    limit?: number
  }
) {
  const page = options?.page || 1
  const limit = options?.limit || 6

  return useQuery({
    queryKey: ["category", category?.id, "paginated-products", page, limit],
    queryFn: async () => {
      if (!category) {
        return {
          data: [],
          pagination: {
            currentPage: page,
            hasMorePages: false
          }
        }
      }

      const categoryIds = [category.id]
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => categoryIds.push(child.id))
      }

      const perCategoryLimit = Math.ceil(limit / categoryIds.length)
      const hasMoreByCategory: Record<number, boolean> = {}
      let allPageProducts: Product[] = []

      for (const categoryId of categoryIds) {
        const response = await apiClient.get<PaginatedResponse<Product>>(
          `/categories/${categoryId}/products`,
          {
            params: {
              page,
              limit: perCategoryLimit
            }
          }
        )

        if (response.data.data) {
          allPageProducts = [...allPageProducts, ...response.data.data]
          hasMoreByCategory[categoryId] = !!response.data.pagination?.next_page_url
        }
      }

      const hasMorePages = Object.values(hasMoreByCategory).some((hasMore) => hasMore)

      return {
        data: allPageProducts,
        pagination: {
          currentPage: page,
          hasMorePages
        }
      }
    },
    enabled: options?.enabled !== false && !!category,
  })
}