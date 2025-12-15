"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCategories,
  useCategoryFilters,
  useFilteredCategoryProducts,
} from "@/features/category/hooks/useCategories";
import { useTranslations } from "next-intl";
import type { Category, Product } from "@/lib/types/api";
import CategoryFilters from "./CategoryFilters";
import CategoryProductsGrid from "./CategoryProductsGrid";
import CategoryFiltersSheet from "./CategoryFiltersSheet";

interface CategoryPageClientProps {
  params: { locale: string; slug: string };
}

export default function CategoryPageClient({
  params,
}: CategoryPageClientProps) {
  const { slug } = params;
  const t = useTranslations();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const selectedCategory = useMemo(() => {
    if (!categoriesData || !slug) return null;

    const findBySlug = (categories: Category[]): Category | null => {
      for (const category of categories) {
        if (category.slug === slug) return category;
        if (category.children) {
          const found = findBySlug(category.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findBySlug(categoriesData);
  }, [categoriesData, slug]);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [priceSort, setPriceSort] = useState<
    "none" | "lowToHigh" | "highToLow"
  >("none");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<Set<number>>(new Set());
  const [selectedFilterCategories, setSelectedFilterCategories] = useState<
    Set<number>
  >(new Set());

  // Fetch filters
  const { data: filtersData } = useCategoryFilters(selectedCategory?.id, {
    enabled: !!selectedCategory,
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

    if (selectedFilterCategories.size > 0) {
      params.categories = Array.from(selectedFilterCategories);
    }

    if (priceRange[0] > 0) {
      params.min_price = priceRange[0];
    }

    if (priceRange[1] < 10000) {
      params.max_price = priceRange[1];
    }

    return params;
  }, [currentPage, selectedBrands, selectedFilterCategories, priceRange]);

  // Fetch filtered products
  const { data: productsData, isFetching } = useFilteredCategoryProducts(
    selectedCategory?.id?.toString() || "",
    filterParams,
    { enabled: !!selectedCategory }
  );

  // Reset on category change
  useEffect(() => {
    if (selectedCategory) {
      setAllProducts([]);
      setCurrentPage(1);
      setSelectedBrands(new Set());
      setSelectedFilterCategories(new Set());
      setPriceRange([0, 10000]);
      setPriceSort("none");
    }
  }, [selectedCategory?.id]);

  // Update products list - BU KISIM ÖNEMLİ!
  useEffect(() => {
    if (productsData?.data) {
      setAllProducts((prev) => {
        // İlk sayfa ise direkt replace et
        if (currentPage === 1) {
          return productsData.data;
        }

        // Sonraki sayfalar için deduplicate et
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = productsData.data.filter(
          (p: Product) => !existingIds.has(p.id)
        );

        // Eğer yeni ürün yoksa, return prev (gereksiz re-render önlenir)
        if (newProducts.length === 0) {
          return prev;
        }

        return [...prev, ...newProducts];
      });
    }
  }, [productsData?.data, currentPage]); // productsData yerine productsData.data

  // hasMore hesaplama - BU KISIM DA ÖNEMLİ!
  const hasMore = useMemo(() => {
    if (!productsData?.pagination) return false;

    // pagination.next_page_url varsa devam et
    if (productsData.pagination.next_page_url) return true;

    // Alternatif olarak: current_page < last_page kontrolü
    if (
      productsData.pagination.current_page &&
      productsData.pagination.last_page
    ) {
      return (
        productsData.pagination.current_page < productsData.pagination.last_page
      );
    }

    // Alternatif 2: hasMorePages flag'i varsa
    if (productsData.pagination.hasMorePages !== undefined) {
      return productsData.pagination.hasMorePages;
    }

    return false;
  }, [productsData?.pagination]);

  const loadMoreData = useCallback(() => {
    if (!hasMore || isFetching) return;
    console.log("Loading page:", currentPage + 1); // Debug için
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, isFetching, currentPage]);

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
    setSelectedFilterCategories((prev) => {
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
    setSelectedFilterCategories(new Set());
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

  
  if (!selectedCategory)
    return <div className="text-center py-8">{t("category_not_found")}</div>;

  return (
    <div className="flex flex-col mx-auto max-w-[1504px] px-2 md:px-4 lg:px-6 pb-12">
      <h2 className="p-4 text-3xl font-bold pb-6 rounded-t-lg mb-0 bg-white">
        {selectedCategory.name}
      </h2>

      <div className="flex p-2 md:p-4 gap-4 bg-white rounded-b-lg">
        {/* Desktop Filters Sidebar */}
        <div className="hidden sm:block w-[280px] shrink-0 border-r px-4">
          <ScrollArea className="h-auto">
            <CategoryFilters
              filtersData={filtersData}
              selectedBrands={selectedBrands}
              selectedFilterCategories={selectedFilterCategories}
              priceSort={priceSort}
              priceRange={priceRange}
              onBrandToggle={handleBrandToggle}
              onCategoryToggle={handleCategoryToggle}
              onPriceSortChange={handlePriceSortChange}
              onPriceChange={handlePriceChange}
              onReset={resetFilters}
              translations={filterTranslations}
            />
          </ScrollArea>
        </div>

        {/* Products Grid */}
        <div className="flex-1 bg-white rounded-lg mb-6">
          <CategoryProductsGrid
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
      <CategoryFiltersSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        filterLabel={t("filter")}
        closeLabel={t("close")}
      >
        <CategoryFilters
          filtersData={filtersData}
          selectedBrands={selectedBrands}
          selectedFilterCategories={selectedFilterCategories}
          priceSort={priceSort}
          priceRange={priceRange}
          onBrandToggle={handleBrandToggle}
          onCategoryToggle={handleCategoryToggle}
          onPriceSortChange={handlePriceSortChange}
          onPriceChange={handlePriceChange}
          onReset={resetFilters}
          translations={filterTranslations}
        />
      </CategoryFiltersSheet>
    </div>
  );
}
