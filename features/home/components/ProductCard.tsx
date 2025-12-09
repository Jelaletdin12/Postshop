"use client";

import { useState, MouseEvent, useEffect, useRef, useCallback } from "react";
import { Heart, ShoppingCart, Loader2, Plus, Minus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useToggleFavorite, useIsFavorite } from "@/lib/hooks";
import {
  useAddToCart,
  useUpdateCartItemQuantity,
  useCart,
} from "@/features/cart/hooks/useCart";
import { useTranslations } from "next-intl";
type ProductCardProps = {
  id: number;
  name: string;
  price: number | null;
  struct_price_text: string;
  discount?: number | null;
  discount_text?: string | null;
  images: string[];
  labels?: { text: string; bg_color: string }[];
  price_color?: string;
  height?: number;
  width?: number;
  button?: boolean;
  stock?: number;
};

export default function ProductCard({
  id,
  name,
  price,
  struct_price_text,
  discount,
  discount_text,
  images,
  labels = [],
  price_color = "#005bff",
  height = 360,
  width = 280,
  button = false,
  stock,
}: ProductCardProps) {
  const { isFavorite, isLoading: isFavoriteLoading } = useIsFavorite(id);
  const { mutate: toggleFavorite, isPending: isFavoriteToggling } =
    useToggleFavorite();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItemQuantity();
  const { data: cartData, refetch: refetchCart } = useCart();

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRequestInFlightRef = useRef(false);
  const pendingQuantityRef = useRef<number | null>(null);

  const hasMultipleImages = images.length > 1;

  const cartItem = cartData?.data?.find((item: any) => item.product?.id === id);
  const isInCart = !!cartItem;
  const isOutOfStock = stock !== undefined && stock === 0;
  const availableStock = stock || 999;
  const t = useTranslations();
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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

    startAutoplay();
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api, hasMultipleImages]);

  // Sync localQuantity with cart
  useEffect(() => {
    if (cartItem?.product_quantity) {
      setLocalQuantity(cartItem.product_quantity);
    } else {
      setLocalQuantity(1);
    }
  }, [cartItem]);

  const syncToServer = useCallback(
    async (quantity: number) => {
      if (isRequestInFlightRef.current) {
        pendingQuantityRef.current = quantity;
        return;
      }

      isRequestInFlightRef.current = true;
      setIsSyncing(true);

      try {
        await updateCartMutation.mutateAsync({
          productId: id,
          quantity: quantity,
        });

        isRequestInFlightRef.current = false;
        setIsSyncing(false);
        await refetchCart();

        if (pendingQuantityRef.current !== null) {
          const nextQuantity = pendingQuantityRef.current;
          pendingQuantityRef.current = null;
          setTimeout(() => syncToServer(nextQuantity), 100);
        }
      } catch (error) {
        console.error("Sync failed:", error);
        isRequestInFlightRef.current = false;
        setIsSyncing(false);
        setLocalQuantity(cartItem?.product_quantity || 1);
      }
    },
    [id, updateCartMutation, cartItem, refetchCart]
  );

  // Debounced sync
  useEffect(() => {
    if (!isInCart) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (localQuantity === (cartItem?.product_quantity || 1)) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      syncToServer(localQuantity);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuantity, isInCart, cartItem, syncToServer]);

  const handleFavorite = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      toggleFavorite(
        { productId: id, isFavorite },
        {
          onSuccess: (data) => {
            toast.success(
              data.wasAdded ? "Added to favorites" : "Removed from favorites"
            );
          },
          onError: () => {
            toast.error("Error. Try again");
          },
        }
      );
    },
    [id, isFavorite, toggleFavorite]
  );

  const handleAddToCart = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsSyncing(true);

      try {
        await addToCartMutation.mutateAsync({
          productId: id,
          quantity: localQuantity,
        });

        await refetchCart();
        setIsSyncing(false);

        toast.success("Added to cart", {
          description: `${name} has been added to your cart`,
        });
      } catch (error) {
        console.error("Add to cart error:", error);
        setIsSyncing(false);
        toast.error("Failed to add to cart");
      }
    },
    [id, name, localQuantity, addToCartMutation, refetchCart]
  );

  const handleQuantityIncrease = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (localQuantity >= availableStock) {
        toast.error("Stock limit reached", {
          description: `Only ${availableStock} items available`,
        });
        return;
      }

      setLocalQuantity((prev) => prev + 1);
    },
    [localQuantity, availableStock]
  );

  const handleQuantityDecrease = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (localQuantity <= 1) return;
      setLocalQuantity((prev) => prev - 1);
    },
    [localQuantity]
  );

  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
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
      className="no-underline flex justify-center"
      onClick={handleCardClick}
    >
      <Card
        className="relative gap-2 border-none shadow-none p-0 w-full overflow-hidden rounded-2xl cursor-pointer"
        style={{ height, maxWidth: width }}
      >
        <div className="relative w-full h-[260px] group">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              watchDrag: false,
            }}
            setApi={setApi}
            className="w-full h-full"
          >
            <CarouselContent className="h-[260px] ml-0">
              {images.map((image, index) => (
                <CarouselItem key={index} className="h-[260px] pl-0">
                  <div className="h-full flex items-center justify-center">
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

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={isFavoriteToggling || isFavoriteLoading}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 hover:bg-white transition-all disabled:opacity-50"
          >
            {isFavoriteLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : isFavorite ? (
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            ) : (
              <Heart className="w-5 h-5 text-gray-700" />
            )}
          </button>

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

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <Badge variant="secondary" className="text-sm font-bold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-0 space-y-1">
          <p
            className="text-sm mx-2 font-medium"
            style={{ color: price_color }}
          >
            {struct_price_text}
          </p>
          <p className="text-black text-sm font-semibold leading-normal truncate mx-2">
            {name}
          </p>
        </CardContent>

        {/* Cart controls - show on hover if button enabled */}
        {button && !isOutOfStock && (
          <div className=" px-1">
            {!isInCart ? (
              <Button
                onClick={handleAddToCart}
                disabled={isSyncing}
                className="w-full rounded-lg gap-2 bg-[#005bff] hover:bg-[#0041c4] cursor-pointer"
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {t("checkout")}
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleQuantityDecrease}
                  disabled={isSyncing || localQuantity <= 1}
                  className="rounded-lg cursor-pointer h-9 w-9 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center font-semibold text-sm border rounded-lg h-9 flex items-center justify-center bg-white relative">
                  {localQuantity}
                  {isSyncing && (
                    <Loader2 className="h-3 w-3 animate-spin absolute -top-1 -right-1 text-blue-500" />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleQuantityIncrease}
                  disabled={localQuantity >= availableStock || isSyncing}
                  className="rounded-lg cursor-pointer h-9 w-9 shrink-0"
                >
                  <Plus className="h-4 w-4 text-[#005bff]" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </a>
  );
}
