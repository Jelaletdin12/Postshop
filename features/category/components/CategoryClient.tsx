"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/features/home/components/ProductCard";
import {
  useCategories,
  useCategoryFilters,
  useFilteredCategoryProducts,
} from "@/features/category/hooks/useCategories";

import { useTranslations } from "next-intl";
import type { Category, Product } from "@/lib/types/api";

interface CategoryPageClientProps {
  params: { locale: string; slug: string };
}

export default function CategoryPageClient({
  params,
}: CategoryPageClientProps) {
  const { slug, locale } = params;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

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
  const { data: filtersData, isLoading: filtersLoading } = useCategoryFilters(
    selectedCategory?.id,
    { enabled: !!selectedCategory }
  );

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
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
  } = useFilteredCategoryProducts(
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
        return [...prev, ...newProducts];
      });
    }
  }, [productsData, currentPage]);

  const hasMore = useMemo(() => {
    return !!productsData?.pagination?.next_page_url;
  }, [productsData]);

  const loadMoreData = useCallback(() => {
    if (!hasMore || isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

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

  const handleBrandToggle = useCallback((brandId: number) => {
    setSelectedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandId)) {
        newSet.delete(brandId);
      } else {
        newSet.add(brandId);
      }
      return newSet;
    });
    setCurrentPage(1);
    setAllProducts([]);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    setSelectedFilterCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
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

  const findCategoryById = useCallback(
    (categories: Category[] | undefined, id: number): Category | null => {
      if (!categories) return null;
      for (const category of categories) {
        if (category.id === id) return category;
        if (category.children) {
          const found = findCategoryById(category.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  

  const FiltersContent = useCallback(
    () => (
      <div className="space-y-6">
        {filtersData?.categories && filtersData.categories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("category")}</h3>
            <div className="space-y-2">
              {filtersData.categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedFilterCategories.has(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {filtersData?.brands && filtersData.brands.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("brands")}</h3>
            <div className="space-y-2">
              {filtersData.brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedBrands.has(brand.id)}
                    onCheckedChange={() => handleBrandToggle(brand.id)}
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">{t("sort")}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={priceSort === "none"}
                onChange={() => handlePriceSortChange("none")}
                className="w-4 h-4"
              />
              <span>{t("default")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={priceSort === "lowToHigh"}
                onChange={() => handlePriceSortChange("lowToHigh")}
                className="w-4 h-4"
              />
              <span>{t("price_low_to_high")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={priceSort === "highToLow"}
                onChange={() => handlePriceSortChange("highToLow")}
                className="w-4 h-4"
              />
              <span>{t("price_high_to_low")}</span>
            </label>
          </div>
        </div>

        <PriceFilter
          title={t("price")}
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
          translations={{ from: t("price_from"), to: t("price_to") }}
        />

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={resetFilters}
        >
          {t("reset")}
        </Button>
      </div>
    ),
    [
      filtersData,
      selectedFilterCategories,
      selectedBrands,
      priceSort,
      priceRange,
      t,
      handleCategoryToggle,
      handleBrandToggle,
      handlePriceSortChange,
      handlePriceChange,
      resetFilters,
    ]
  );

  if (categoriesLoading) return <div>{t("common.loading")}</div>;
  if (!selectedCategory)
    return <div className="text-center py-8">{t("category_not_found")}</div>;

  const totalItems =
    productsData?.pagination?.total || sortedProducts.length || 0;

  return (
    <div className="flex flex-col  mx-auto max-w-[1504px]
    px-2 md:px-4 lg:px-6  pb-12 
    ">
      <h2 className="p-4 text-3xl font-bold pb-6 rounded-lg mb-0 bg-white">{selectedCategory.name}</h2>
      

      <div className="flex gap-4 bg-white rounded-lg">
        <div className="hidden sm:block w-[280px] shrink-0 border-r px-4 ">
          <ScrollArea className="h-[calc(100vh-200px)] ">
            <FiltersContent />
          </ScrollArea>
        </div>

        <div className="flex-1 bg-white rounded-lg">
          {sortedProducts.length > 0 ? (
            <InfiniteScroll
              dataLength={sortedProducts.length}
              next={loadMoreData}
              hasMore={hasMore}
              scrollThreshold={0.8}
              style={{ overflow: "visible" }}
              loader={
                <div className="flex justify-center py-4">
                  <div>{t("common.loading")}</div>
                </div>
              }
            >
              <div className="bg-white rounded-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={
                      product.price_amount
                        ? parseFloat(product.price_amount)
                        : null
                    }
                    struct_price_text={`${product.price_amount} TMT`}
                    images={[product.media?.[0]?.images_400x400]}
                   
                    button={true}                 />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("no_results")}
            </div>
          )}
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="sm:hidden fixed bottom-20 right-4 rounded-xl font-bold gap-2 z-10 shadow-lg"
            size="lg"
          >
            {t("filter")}
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{t("filter")}</SheetTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-md ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("close")}</span>
            </button>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] p-4">
            <FiltersContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PriceFilter({
  title,
  priceRange,
  onPriceChange,
  translations,
}: {
  title: string;
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  translations: { from: string; to: string };
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="price-from" className="text-xs mb-1">
              {translations.from}
            </Label>
            <Input
              id="price-from"
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])
              }
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="price-to" className="text-xs mb-1">
              {translations.to}
            </Label>
            <Input
              id="price-to"
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceChange([
                  priceRange[0],
                  parseInt(e.target.value) || 10000,
                ])
              }
              className="rounded-lg"
            />
          </div>
        </div>
        <Slider
          min={0}
          max={99999}
          step={100}
          value={priceRange}
          onValueChange={onPriceChange}
          className="mt-2"
        />
      </div>
    </div>
  );
}
