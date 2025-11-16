import { Skeleton } from "@/components/ui/skeleton"
import ProductGridSkeleton from "./ProductGridSkeleton"
import CategorySkeleton from "../../category/components/CategorySkeleton"

export default function HomeSkeleton() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-8 pb-12 space-y-8">
      {/* Hero Carousel Skeleton */}
      <section className="rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-[200px] sm:h-[300px] md:h-[420px] bg-gray-200" />
      </section>

      {/* Categories Section Skeleton */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4 bg-gray-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4 bg-gray-200" />
        <ProductGridSkeleton count={10} columns="5" />
      </section>
    </div>
  )
}
