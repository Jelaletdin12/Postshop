import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Favorite } from "@/lib/types/api";

interface FavoritesResponse {
  data?: Favorite[];
  [key: string]: any;
}

function transformFavoritesResponse(response: any): Favorite[] {
  if (typeof response === "object" && response.data) {
    return response.data;
  }
  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      return parsed.data || [];
    } catch {
      return [];
    }
  }
  return [];
}

// Fetch ALL favorite products (handle pagination on backend)
async function fetchAllFavorites(): Promise<Favorite[]> {
  const allFavorites: Favorite[] = [];
  let currentPage = 1;
  let hasMorePages = true;
  let lastError: Error | null = null;

  while (hasMorePages) {
    try {
      const response = await apiClient.get("/favorites", {
        params: { page: currentPage, perPage: 100 },
      });

      const favorites = transformFavoritesResponse(response.data);
      allFavorites.push(...favorites);

      const pagination = response.data?.pagination;
      if (pagination?.next_page_url) {
        currentPage++;
      } else {
        hasMorePages = false;
      }
    } catch (error) {
    
      if (currentPage === 1) {
        throw error;
      }
      
      
      lastError = error as Error;
      hasMorePages = false;
    }
  }

  
  if (allFavorites.length === 0 && lastError) {
    throw lastError;
  }

  return allFavorites;
}

// Get all favorites with automatic pagination
export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: fetchAllFavorites,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    retry: 1,
  });
}

// Get favorite product IDs as Set for O(1) lookup - ALWAYS loads favorites first
export function useFavoriteIds() {
  const { data: favorites, isLoading } = useFavorites();

  // Return Set with IDs, empty Set while loading
  return {
    favoriteIds: new Set(favorites?.map((fav) => fav.product.id) || []),
    isLoading,
  };
}

// Check if product is favorited - with loading state
export function useIsFavorite(productId: number) {
  const { favoriteIds, isLoading } = useFavoriteIds();

  return {
    isFavorite: favoriteIds.has(productId),
    isLoading,
  };
}

// Toggle favorite (add/remove) with optimistic updates
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      isFavorite,
    }: {
      productId: number;
      isFavorite: boolean;
    }) => {
      const formData = new URLSearchParams({
        product_id: productId.toString(),
      });

      await apiClient.post("/favorites", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return { productId, wasAdded: !isFavorite };
    },
    onMutate: async ({ productId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      // Snapshot previous
      const previousFavorites = queryClient.getQueryData<Favorite[]>([
        "favorites",
      ]);

      // Optimistically update
      queryClient.setQueryData<Favorite[]>(["favorites"], (old = []) => {
        if (isFavorite) {
          // Remove from favorites
          return old.filter((fav) => fav.product.id !== productId);
        }
        // For add, we'll refetch to get full product data
        return old;
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

// Add to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const formData = new URLSearchParams({
        product_id: productId.toString(),
      });

      await apiClient.post("/favorites", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

// Remove from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const formData = new URLSearchParams({
        product_id: productId.toString(),
      });

      await apiClient.post("/favorites", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
