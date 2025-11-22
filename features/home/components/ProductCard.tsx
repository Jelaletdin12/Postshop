"use client";

import { useState, MouseEvent, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  id: number;
  name: string;
  price: number | null;
  struct_price_text: string;
  discount?: number | null;
  discount_text?: string | null;
  images: string[];
  is_favorite: boolean;
  labels?: { text: string; bg_color: string }[];
  price_color?: string;
  height?: number;
  width?: number;
  button?: boolean;
};

export default function ProductCard({
  id,
  name,
  price,
  struct_price_text,
  discount,
  discount_text,
  images,
  is_favorite,
  labels = [],
  price_color = "#005bff",
  height = 360,
  width = 280,
  button = true,
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(is_favorite);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const hasMultipleImages = images.length > 1;

  // Track carousel current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play functionality - 3 seconds
  useEffect(() => {
    if (!api || !hasMultipleImages) return;

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
      }, 3000);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    startAutoplay();

    return () => stopAutoplay();
  }, [api, hasMultipleImages]);

  const handleFavorite = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);

    if (newFavoriteState) {
      toast.success("Товар добавлен в избранное");
    } else {
      toast.success("Товар удален из избранного");
    }
  };

  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[data-carousel-control="true"]')
    ) {
      e.preventDefault();
    }
  };

  const handleNavClick = (e: MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <a
      href={`/product/${id}`}
      className="no-underline block"
      onClick={handleCardClick}
    >
      <Card
        className="relative gap-2 border-none shadow-none p-0 w-full overflow-hidden rounded-2xl hover:shadow-md transition-all cursor-pointer"
        style={{ height, maxWidth: width }}
      >
        {/* Image Section with Carousel */}
        <div className="relative w-full h-[260px] group">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              watchDrag: false, // Disable drag/swipe on desktop
            }}
            setApi={setApi}
            className="w-full h-full"
          >
            <CarouselContent className="h-[260px] ml-0">
              {images.map((image, index) => (
                <CarouselItem key={index} className="h-[260px] pl-0">
                  <div className="h-full flex items-center justify-center p-2">
                    <img
                      src={image}
                      alt={`${name} - ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      draggable="false"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                <CarouselPrevious
                  data-carousel-control="true"
                  className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => handleNavClick(e, () => api?.scrollPrev())}
                />
                <CarouselNext
                  data-carousel-control="true"
                  className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => handleNavClick(e, () => api?.scrollNext())}
                />
              </>
            )}
          </Carousel>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 hover:bg-white transition-all"
          >
            {favorite ? (
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            ) : (
              <Heart className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  data-carousel-control="true"
                  onClick={(e) => handleNavClick(e, () => api?.scrollTo(index))}
                  className={`h-1.5 rounded-full transition-all ${
                    index === current ? "w-6 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Labels */}
          {labels?.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {labels.map((label, idx) => (
                <Badge
                  key={idx}
                  className="text-white text-[10px] font-bold uppercase rounded-r-md"
                  style={{ backgroundColor: label.bg_color }}
                >
                  {label.text}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-0 space-y-1">
          <p
            className="text-sm font-semibold mx-2"
            style={{ color: price_color }}
          >
            {struct_price_text}
          </p>
          <p className="text-gray-800 text-sm truncate mx-2">{name}</p>
        </CardContent>
      </Card>
    </a>
  );
}