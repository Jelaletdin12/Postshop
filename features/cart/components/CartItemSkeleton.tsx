import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function CartItemSkeleton() {
  return (
    <Card className="p-4 rounded-xl">
      <div className="flex gap-4">
        {/* Product Image */}
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0 bg-gray-200" />

        {/* Product Info */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
          <Skeleton className="h-4 w-1/2 bg-gray-200" />
          <Skeleton className="h-6 w-20 bg-gray-200 mt-2" />
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-200" />
          <Skeleton className="w-8 h-8 bg-gray-200" />
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-200" />
        </div>
      </div>
    </Card>
  )
}
