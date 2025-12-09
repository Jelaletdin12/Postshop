"use client";

import { useFavorites } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import ProductCard from "@/features/home/components/ProductCard";
import type { Favorite } from "@/lib/types/api";

export default function FavoritesPage() {
  const t = useTranslations();
  const { data: favorites, isLoading, isError } = useFavorites();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("favorite_products")}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8  bg-white">
        <h1 className="text-3xl font-bold mb-6">{t("favorite_products")}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t("empty_favorites")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6   
     md:px-4 lg:px-6  pb-12 space-y-8 max-w-[1504px] 
    ">
      <h1 className="bg-white text-3xl p-4 font-bold mb-0 pb-6">{t("favorite_products")}</h1>
      <div className="bg-white grid grid-cols-2 sm:grid-cols-3 rounded-lg md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
        {favorites.map((favorite: Favorite) => {
          const product = favorite.product;

          const allImages = product.media
            ?.map(
              (media) =>
                media.images_800x800 ||
                media.images_720x720 ||
                media.images_400x400 ||
                media.thumbnail
            )
            .filter(Boolean) || ["/placeholder-product.jpg"];

          const formattedPrice = product.price_amount
            ? `${parseFloat(product.price_amount).toFixed(2)} TMT`
            : "Price not available";

          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={
                product.price_amount ? parseFloat(product.price_amount) : null
              }
              struct_price_text={formattedPrice}
              images={allImages}
              labels={[]}
              price_color="#0059ff"
              height={360}
              width={250}
              button={true}
              stock={product.stock}
            />
          );
        })}
      </div>
    </div>
  );
}
