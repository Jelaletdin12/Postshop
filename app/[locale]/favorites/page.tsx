"use client";

import { useFavorites } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import ProductCard from "@/features/home/components/ProductCard";
import type { Favorite } from "@/lib/types/api";
import EmptyFavorites from "@/features/favorites/components/EmptyFavorites";
import ErrorPage from "@/components/ErrorPage";
import Placeholder from "@/public/logo.webp";

export default function FavoritesPage() {
  const t = useTranslations();
  const { data: favorites, isLoading, isError } = useFavorites();

  if (isLoading) {
    return (
      <div className="mx-auto px-2 md:px-4 lg:px-6 pb-12 space-y-8 max-w-[1504px]">
        <h1 className="bg-white text-3xl p-4 font-bold mb-0 pb-6">
          {t("favorite_products")}
        </h1>
        <div className="bg-white grid grid-cols-2 sm:grid-cols-3 rounded-b-lg md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full h-[260px] rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-2" />
              <Skeleton className="h-6 w-1/2 mx-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorPage />;
  }

  if (!favorites || favorites.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <div
      className=" mx-auto px-2 md:px-4 lg:px-6  pb-12 space-y-8 max-w-[1504px] 
    "
    >
      <h1 className="bg-white text-3xl p-4 font-bold mb-0 pb-6">
        {t("favorite_products")}
      </h1>
      <div className="bg-white grid grid-cols-2 sm:grid-cols-3 rounded-b-lg md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
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
            .filter(Boolean) || [Placeholder];

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
              button={false}
              stock={product.stock}
            />
          );
        })}
      </div>
    </div>
  );
}
