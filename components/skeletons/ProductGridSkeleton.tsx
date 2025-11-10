import ProductCardSkeleton from "./ProductCardSkeleton"

interface ProductGridSkeletonProps {
  count?: number
  columns?: "2" | "3" | "4" | "5"
}

export default function ProductGridSkeleton({ count = 8, columns = "4" }: ProductGridSkeletonProps) {
  const gridClass =
    {
      "2": "grid-cols-2",
      "3": "md:grid-cols-3",
      "4": "md:grid-cols-4 lg:grid-cols-4",
      "5": "md:grid-cols-4 xl:grid-cols-5",
    }[columns] || "md:grid-cols-4"

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
