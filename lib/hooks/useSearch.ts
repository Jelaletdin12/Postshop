import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { SearchFilters, SearchResponse } from "@/lib/types/api"

export function useSearch(options: SearchFilters) {
  const { q, category_id, brand_id, price_from, price_to, page = 1, per_page = 20 } = options

  return useQuery({
    queryKey: ["search", { q, category_id, brand_id, price_from, price_to, page, per_page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(per_page),
      })

      if (q) params.append("q", q)
      if (category_id) params.append("category_id", String(category_id))
      if (brand_id) params.append("brand_id", String(brand_id))
      if (price_from) params.append("price_from", String(price_from))
      if (price_to) params.append("price_to", String(price_to))

      const response = await apiClient.get<SearchResponse>(`/search?${params}`)
      return response.data
    },
    enabled: !!q && q.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
