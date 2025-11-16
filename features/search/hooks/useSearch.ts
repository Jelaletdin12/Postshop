import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { SearchResponse, SearchParams } from "../types";

export function useSearchProducts(params: SearchParams) {
  const { q, barcode } = params;

  return useQuery({
    queryKey: ["search", { q, barcode }],
    queryFn: async () => {
      if (barcode) {
        const response = await apiClient.get<SearchResponse>(
          `/search-product-barcode?barcode=${barcode}`
        );
        return response.data;
      }

      if (q) {
        const response = await apiClient.get<SearchResponse>(
          `/search-product?q=${encodeURIComponent(q)}`
        );
        return response.data;
      }

      return { message: "success", data: [] };
    },
    enabled: !!(q && q.length > 0) || !!barcode,
    staleTime: 1000 * 60 * 5,
  });
}