"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCollections,
  useCollectionFilters,
  useFilteredCollectionProducts,
} from "@/features/collections/hooks/useCollections";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/types/api";
import CollectionFilters from "./CollectionFilters";
import CollectionProductsGrid from "./CollectionProductsGrid";
import CollectionFiltersSheet from "./CollectionFiltersSheet";
import ErrorPage from "@/components/ErrorPage";

interface CollectionPageClientProps {
  params: { locale: string; slug: string };
}

export default function CollectionPageClient({
  params,
}: CollectionPageClientProps) {
  const { slug } = params;
  const t = useTranslations();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollections();

  const selectedCollection = useMemo(() => {
    if (!collectionsData || !slug) return null;
    return collectionsData.find((col) => col.slug === slug);
  }, [collectionsData, slug]);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [priceSort, setPriceSort] = useState<
    "none" | "lowToHigh" | "highToLow"
  >("none");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );

  // Fetch filters
  const {
    data: filtersData,
    isLoading: filtersLoading,
    isError: filtersError,
  } = useCollectionFilters(selectedCollection?.id, {
    enabled: !!selectedCollection,
  });

  // Build filter params
  const filterParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: 6,
    };

    if (selectedBrands.size > 0) {
      params.brands = Array.from(selectedBrands);
    }

    if (selectedCategories.size > 0) {
      params.categories = Array.from(selectedCategories);
    }

    params.min_price = priceRange[0];
    params.max_price = priceRange[1];

    return params;
  }, [currentPage, selectedBrands, selectedCategories, priceRange]);

  // Fetch filtered products
  const {
    data: productsData,
    isFetching,
    isError: productsError,
  } = useFilteredCollectionProducts(
    selectedCollection?.id?.toString() || "",
    filterParams,
    { enabled: !!selectedCollection }
  );

  // Reset on collection change
  useEffect(() => {
    if (selectedCollection) {
      setAllProducts([]);
      setCurrentPage(1);
      setSelectedBrands(new Set());
      setSelectedCategories(new Set());
      setPriceRange([0, 10000]);
      setPriceSort("none");
    }
  }, [selectedCollection?.id]);

  // Update products list
  useEffect(() => {
    if (productsData?.data) {
      setAllProducts((prev) => {
        if (currentPage === 1) {
          return productsData.data;
        }

        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = productsData.data.filter(
          (p: Product) => !existingIds.has(p.id)
        );

        if (newProducts.length === 0) {
          return prev;
        }

        return [...prev, ...newProducts];
      });
    }
  }, [productsData?.data, currentPage]);

  const hasMore = useMemo(() => {
    return !!productsData?.pagination?.next_page_url;
  }, [productsData]);

  const loadMoreData = useCallback(() => {
    if (!hasMore || isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const products = [...allProducts];
    if (priceSort === "lowToHigh") {
      return products.sort(
        (a, b) =>
          parseFloat(a.price_amount || "0") - parseFloat(b.price_amount || "0")
      );
    }
    if (priceSort === "highToLow") {
      return products.sort(
        (a, b) =>
          parseFloat(b.price_amount || "0") - parseFloat(a.price_amount || "0")
      );
    }
    return products;
  }, [allProducts, priceSort]);

  // Filter handlers
  const handleBrandToggle = useCallback((brandId: number) => {
    setSelectedBrands((prev) => {
      const newSet = new Set(prev);
      newSet.has(brandId) ? newSet.delete(brandId) : newSet.add(brandId);
      return newSet;
    });
    setCurrentPage(1);
    setAllProducts([]);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(categoryId)
        ? newSet.delete(categoryId)
        : newSet.add(categoryId);
      return newSet;
    });
    setCurrentPage(1);
    setAllProducts([]);
  }, []);

  const handlePriceChange = useCallback((values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setCurrentPage(1);
    setAllProducts([]);
  }, []);

  const handlePriceSortChange = useCallback(
    (sortType: "none" | "lowToHigh" | "highToLow") => {
      setPriceSort(sortType);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setPriceRange([0, 10000]);
    setPriceSort("none");
    setCurrentPage(1);
    setAllProducts([]);
  }, []);

  const filterTranslations = useMemo(
    () => ({
      category: t("category"),
      brands: t("brands"),
      sort: t("sort"),
      default: t("default"),
      price_low_to_high: t("price_low_to_high"),
      price_high_to_low: t("price_high_to_low"),
      price: t("price"),
      price_from: t("price_from"),
      price_to: t("price_to"),
      reset: t("reset"),
    }),
    [t]
  );

  // ERROR STATE
  if (collectionsError || productsError || filtersError) {
    return <ErrorPage />;
  }

  // LOADING STATE
  if (collectionsLoading) {
    return (
      <div className="flex flex-col mx-auto max-w-[1504px] px-2 md:px-4 lg:px-6 pb-12">
        {/* Title Skeleton */}
        <Skeleton className="h-16 w-full rounded-t-lg mb-0 bg-white" />

        <div className="flex p-2 md:p-4 gap-4 bg-white rounded-b-lg mt-0">
          {/* Desktop Filters Skeleton */}
          <div className="hidden sm:block w-[280px] shrink-0 border-r px-4 space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COLLECTION NOT FOUND
  if (!selectedCollection) {
    return <div className="text-center py-8">{t("collection_not_found")}</div>;
  }

  return (
    <div className="flex flex-col mx-auto max-w-[1504px] px-2 md:px-4 lg:px-6 pb-12">
      <h2 className="p-4 text-3xl font-bold pb-6 rounded-t-lg mb-0 bg-white">
        {selectedCollection.name}
      </h2>

      <div className="flex p-2 md:p-4 gap-4 bg-white rounded-b-lg">
        {/* Desktop Filters Sidebar */}
        <div className="hidden sm:block w-[280px] shrink-0 border-r px-4">
          <ScrollArea className="h-auto">
            {filtersLoading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : (
              <CollectionFilters
                filtersData={filtersData}
                selectedBrands={selectedBrands}
                selectedCategories={selectedCategories}
                priceSort={priceSort}
                priceRange={priceRange}
                onBrandToggle={handleBrandToggle}
                onCategoryToggle={handleCategoryToggle}
                onPriceSortChange={handlePriceSortChange}
                onPriceChange={handlePriceChange}
                onReset={resetFilters}
                translations={filterTranslations}
              />
            )}
          </ScrollArea>
        </div>

        {/* Products Grid */}
        <div className="flex-1 bg-white rounded-lg mb-6">
          <CollectionProductsGrid
            products={sortedProducts}
            hasMore={hasMore}
            onLoadMore={loadMoreData}
            isFetching={isFetching}
            translations={{
              loading: t("common.loading"),
              no_results: t("no_results"),
            }}
          />
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <CollectionFiltersSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        filterLabel={t("filter")}
        closeLabel={t("close")}
      >
        {filtersLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <CollectionFilters
            filtersData={filtersData}
            selectedBrands={selectedBrands}
            selectedCategories={selectedCategories}
            priceSort={priceSort}
            priceRange={priceRange}
            onBrandToggle={handleBrandToggle}
            onCategoryToggle={handleCategoryToggle}
            onPriceSortChange={handlePriceSortChange}
            onPriceChange={handlePriceChange}
            onReset={resetFilters}
            translations={filterTranslations}
          />
        )}
      </CollectionFiltersSheet>
    </div>
  );
}
