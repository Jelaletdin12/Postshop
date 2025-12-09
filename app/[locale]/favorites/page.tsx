"use client";
import {
  useFavorites,
  useAddToCart,
  useRemoveFromFavorites,
} from "@/lib/hooks";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import type { Favorite } from "@/lib/types/api";

export default function FavoritesPage() {
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const { toast } = useToast();
  const t = useTranslations();

  const { data: favorites, isLoading, isError } = useFavorites();
  const { mutate: removeFromFavorites, isPending: isRemoving } =
    useRemoveFromFavorites();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const handleRemoveFromFavorites = useCallback(
    (productId: number) => {
      removeFromFavorites(productId, {
        onSuccess: () => {
          toast({
            title: t("removed_from_favorites"),
          });
        },
        onError: (error) => {
          toast({
            title: t("error"),
            description: error.message,
            variant: "destructive",
          });
        },
      });
    },
    [removeFromFavorites, toast, t]
  );

  const handleAddToCart = useCallback(
    (productId: number) => {
      addToCart(
        { productId },
        {
          onSuccess: () => {
            toast({
              title: t("added_to_cart"),
            });
          },
          onError: (error) => {
            toast({
              title: t("error"),
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    },
    [addToCart, toast, t]
  );

  const loadingSkeleton = useMemo(
    () => (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("favorite_products")}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      </div>
    ),
    [t]
  );

  if (isLoading) {
    return loadingSkeleton;
  }

  if (isError || !favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("favorite_products")}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t("empty_favorites")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t("favorite_products")}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((favorite: Favorite) => (
          <ProductCard
            key={favorite.product.id}
            productId={favorite.product.id}
            product={favorite.product}
            onRemove={() => handleRemoveFromFavorites(favorite.product.id)}
            onAddToCart={() => handleAddToCart(favorite.product.id)}
            onHover={setIsHovered}
            isHovered={isHovered === favorite.product.id}
            isRemoving={isRemoving}
            isAddingToCart={isAddingToCart}
          />
        ))}
      </div>
    </div>
  );
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price_amount: string;
  old_price_amount?: string | null;
  media: Array<{
    thumbnail: string;
    images_400x400: string;
    images_720x720: string;
    images_800x800: string;
    images_1200x1200: string;
  }>;
  stock: number;
}

interface ProductCardProps {
  productId: number;
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
  onHover: (id: number | null) => void;
  isHovered: boolean;
  isRemoving: boolean;
  isAddingToCart: boolean;
}

function ProductCard({
  productId,
  product,
  onRemove,
  onAddToCart,
  onHover,
  isHovered,
  isRemoving,
  isAddingToCart,
}: ProductCardProps) {
  const t = useTranslations();

  if (!product) return null;

  const imageUrl =
    product.media?.[0]?.images_800x800 ||
    product.media?.[0]?.thumbnail ||
    "/placeholder.svg";

  const price = `${parseFloat(product.price_amount).toFixed(2)} TMT`;
  const oldPrice = product.old_price_amount
    ? `${parseFloat(product.old_price_amount).toFixed(2)} TMT`
    : null;

  return (
    <Card
      className="group overflow-hidden rounded-xl transition-shadow hover:shadow-lg relative border-none"
      onMouseEnter={() => onHover(productId)}
      onMouseLeave={() => onHover(null)}
    >
      <Link href={`/product/${productId || product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            disabled={isRemoving}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          </button>

          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform"
            priority={false}
          />

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                {t("out_of_stock")}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">
            {product.name}
          </h3>
          <div className="space-y-1">
            {oldPrice && (
              <p className="text-sm text-gray-400 line-through">{oldPrice}</p>
            )}
            <p className="text-lg font-bold text-blue-600">{price}</p>
          </div>
        </div>
      </Link>

      {isHovered && product.stock > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            disabled={isAddingToCart}
            className="w-full rounded-xl gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("add_to_cart")}
          </Button>
        </div>
      )}
    </Card>
  );
}
