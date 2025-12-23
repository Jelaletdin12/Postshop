import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartItemSkeleton() {
  return (
    <Card className="p-4 shadow-none border">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4 flex-1">
          <Skeleton className="w-[88px] h-[117px] rounded-xl" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-40 rounded-lg" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    </Card>
  );
}


