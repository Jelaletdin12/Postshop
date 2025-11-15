import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Favorite } from "@/lib/types/api";

// Response tiplerini tanımlayalım
interface FavoritesResponse {
  data?: Favorite[];
  [key: string]: any;
}

interface FavoriteActionResponse {
  data?: string | Favorite[];
  [key: string]: any;
}

// Response'u transform eden yardımcı fonksiyon
function transformFavoritesResponse(response: any): Favorite[] {
  if (typeof response === "object" && response.data) {
    return response.data;
  }

  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      return parsed.data || [];
    } catch (error) {
      console.error("Failed to parse favorites response:", error);
      return [];
    }
  }

  return [];
}

function transformActionResponse(response: any, defaultValue: string): string {
  if (typeof response === "object" && response.data) {
    return response.data;
  }

  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      return parsed.data || defaultValue;
    } catch (error) {
      if (response.includes("<!doctype html>")) {
        return defaultValue;
      }
      console.error(`Failed to parse favorite response:`, error);
      return defaultValue;
    }
  }

  return defaultValue;
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await apiClient.get("/favorites");
      return transformFavoritesResponse(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const formData = new URLSearchParams({
        product_id: productId.toString(),
      });

      const response = await apiClient.post("/favorites", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return transformActionResponse(response.data, "Added");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const formData = new URLSearchParams({
        product_id: productId.toString(),
      });

      const response = await apiClient.post("/favorites", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return transformActionResponse(response.data, "Removed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
