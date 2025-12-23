import { useState } from "react";
import { Star, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, text: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ReviewModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const t = useTranslations();

  const handleClose = () => {
    onOpenChange(false);
    setRating(0);
    setText("");
    setHoveredStar(0);
  };

  const handleSubmit = async () => {
    await onSubmit(rating, text);
    handleClose();
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-all ${
              star <= (hoveredStar || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("write_review")}</DialogTitle>
          <DialogDescription>
            {t("share_experience")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("rating")}</label>
            {renderStars()}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("your_review")}
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("write_review")}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {text.length}/500 {t("characters")}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-lg cursor-pointer"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || !text.trim() || isSubmitting}
            className="flex-1 rounded-lg cursor-pointer bg-[#005bff] hover:bg-[#0041c4]"
          >
            {isSubmitting ? (
              <>
                
                {t("submitting")}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t("submit_review")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}