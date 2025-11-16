import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
        </div>

        {/* Price skeleton */}
        <Skeleton className="h-6 w-1/2 bg-gray-200" />
      </div>
    </Card>
  )
}
