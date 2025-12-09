"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import HeroCarousel from "./Carousel";
import CategoryGrid from "./CategoryGrid";
import CollectionSection from "./ProductGrid";
import {
  useCategories,
  useCarousels,
  useCollections,
  useFavorites,
} from "@/lib/hooks";

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const { data: carousels, isLoading: carouselsLoading } = useCarousels();

  const {
    data: collections,
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollections();

  // CRITICAL: Prefetch favorites on mount to avoid loading states
  const { isLoading: favoritesLoading } = useFavorites();

  useEffect(() => setMounted(true), []);

  const loadMore = () => {
    if (collections && visibleCount < collections.length) {
      setVisibleCount((prev) => Math.min(prev + 10, collections.length));
    }
  };

  if (!mounted) return <div className="p-8">Loading...</div>;

  const carouselItems =
    carousels?.map((carousel) => ({
      title: carousel.title || "",
      image: carousel.image || carousel.thumbnail,
      url: carousel.link || null,
    })) || [];

  const visibleCollections = collections?.slice(0, visibleCount) || [];
  const hasMore = collections ? visibleCount < collections.length : false;

  // Show loading indicator while favorites are being fetched
  const showFavoritesLoading =
    favoritesLoading && !categoriesLoading && !collectionsLoading;

  return (
    <div className="px-2 md:px-4 lg:px-6 pt-4 pb-12 space-y-8 max-w-[1504px] mx-auto">
      {!carouselsLoading && carouselItems.length > 0 && (
        <HeroCarousel items={carouselItems} />
      )}

      <CategoryGrid
        categories={categories}
        isLoading={categoriesLoading}
        isError={categoriesError}
        locale={locale}
        title={t("categories")}
      />

      {showFavoritesLoading && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-500 text-sm mt-2">Loading favorites...</p>
        </div>
      )}

      {collectionsError ? (
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-red-600">
            Failed to load collections. Please try again.
          </p>
        </section>
      ) : collectionsLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-64 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={visibleCollections.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-gray-500 mt-2">Loading more collections...</p>
            </div>
          }
          endMessage={
            <div className="text-center py-8">
              <p className="text-gray-600">✓ All collections loaded</p>
            </div>
          }
          scrollThreshold={0.8}
        >
          <div className="space-y-8">
            {visibleCollections.map((collection) => (
              <CollectionSection
                key={collection.id}
                collection={collection}
                locale={locale}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
