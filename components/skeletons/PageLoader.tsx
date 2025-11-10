import { Skeleton } from "@/components/ui/skeleton"
import ProductGridSkeleton from "./ProductGridSkeleton"
import CartItemSkeleton from "./CartItemSkeleton" // Added import for CartItemSkeleton

interface PageLoaderProps {
  /**
   * Type of page loading skeleton
   * home, products, category, search, cart, favorites, orders, profile
   */
  type?: "home" | "products" | "category" | "search" | "cart" | "favorites" | "orders" | "profile"
}

export default function PageLoader({ type = "products" }: PageLoaderProps) {
  switch (type) {
    case "home":
      return (
        <div className="px-4 md:px-8 lg:px-12 pt-8 pb-12 space-y-8">
          {/* Hero Banner */}
          <Skeleton className="w-full h-[300px] rounded-2xl bg-gray-200" />

          {/* Categories */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-gray-200" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-gray-200" />
            <ProductGridSkeleton count={8} columns="5" />
          </div>
        </div>
      )

    case "products":
    case "search":
      return (
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <div className="space-y-4 mb-6">
            <Skeleton className="h-8 w-40 bg-gray-200" />
          </div>
          <ProductGridSkeleton count={12} columns="5" />
        </div>
      )

    case "category":
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className="hidden sm:block w-[280px] space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                </div>
              ))}
            </div>

            {/* Products */}
            <div className="flex-1">
              <ProductGridSkeleton count={12} columns="5" />
            </div>
          </div>
        </div>
      )

    case "cart":
      return (
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-40 mb-6 bg-gray-200" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            {/* Order Summary */}
            <div className="lg:w-[420px]">
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case "orders":
    case "favorites":
      return (
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-40 mb-6 bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      )

    case "profile":
      return (
        <div className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="container mx-auto max-w-2xl">
            <Skeleton className="h-8 w-40 mb-6 bg-gray-200" />
            <div className="bg-white p-6 rounded-xl space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    default:
      return <ProductGridSkeleton count={12} columns="5" />
  }
}
