"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import HeroCarousel from "./Carousel";
import CategoryGrid from "./CategoryGrid";
import CollectionSection from "./ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCarousels,
  useCollections,
  useFavorites,
} from "@/lib/hooks";

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations("common");
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

  useFavorites();

  const loadMore = () => {
    if (collections && visibleCount < collections.length) {
      setVisibleCount((prev) => Math.min(prev + 10, collections.length));
    }
  };

  const carouselItems =
    carousels?.map((c) => ({
      title: c.title || "",
      image: c.image || c.thumbnail,
      url: c.link || null,
    })) || [];

  const visibleCollections = collections?.slice(0, visibleCount) || [];
  const hasMore = collections ? visibleCount < collections.length : false;

  return (
    <div className="px-2 md:px-4 lg:px-6 pt-4 pb-12 space-y-8 max-w-[1504px] mx-auto">
      {carouselsLoading ? (
        <section className=" bg-white rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-[200px] sm:h-[300px] md:h-[496px]" />
        </section>
      ) : (
        carouselItems.length > 0 && <HeroCarousel items={carouselItems} />
      )}

      <CategoryGrid
        categories={categories}
        isLoading={categoriesLoading}
        isError={categoriesError}
        locale={locale}
        title={t("categories")}
      />

      {collectionsError ? (
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-red-600">
            Failed to load collections. Please try again.
          </p>
        </section>
      ) : collectionsLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <section key={i} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="w-full h-[260px] rounded-xl" />
                    <Skeleton className="h-4 w-3/4 mx-2" />
                    <Skeleton className="h-6 w-1/2 mx-2" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={visibleCollections.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="text-gray-500 mt-2">{t("loading")}</p>
            </div>
          }
          endMessage={
            <div className="text-center py-8">
              <p className="text-gray-600">✓ {t("all_collections_loaded")}</p>
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
