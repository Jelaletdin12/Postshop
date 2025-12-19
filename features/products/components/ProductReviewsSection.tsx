import { Star, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface Review {
  id: number;
  rating: number;
  title: string;
  created_at: string;
}

interface ProductReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  isLoading: boolean;
  onWriteReview: () => void;
}

export function ProductReviewsSection({
  reviews,
  averageRating,
  isLoading,
  onWriteReview,
}: ProductReviewsSectionProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 transition-all ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const t= useTranslations();

  return (
    <Card className="p-6 rounded-xl">
      <div className="flex justify-between items-center ">
        <div>
          <h3 className="text-2xl font-bold">{t("customer_reviews")}</h3>
          <div className="flex items-center gap-2 mt-2">
            {renderStars(Math.round(averageRating))}
            {/* <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} out of 5
            </span> */}
          </div>
        </div>
        <Button onClick={onWriteReview} className="rounded-lg cursor-pointer bg-[#005bff] hover:bg-[#0041c4]">
          <Send className="mr-2 h-4 w-4" />
          {t("write_review")}
        </Button>
      </div>

      <Separator className="my-4" />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {renderStars(review.rating)}
                  
                </div>
              </div>
              <p className="text-gray-700">{review.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t("no_reviews")}
        </div>
      )}
    </Card>
  );
}