import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function OrderSummarySkeleton() {
  return (
    <Card className="w-full md:w-[380px] p-4 md:p-6 rounded-xl h-fit sticky top-20">
      {/* Customer Information */}
      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-3" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Payment Type */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-20 rounded-lg" />
          <Skeleton className="flex-1 h-20 rounded-lg" />
        </div>
      </div>

      {/* Region Selection */}
      <div className="mb-6">
        <Skeleton className="h-6 w-36 mb-3" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Province Selection */}
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Note */}
      <div className="mb-6">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Billing */}
      <div className="space-y-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </Card>
  );
}