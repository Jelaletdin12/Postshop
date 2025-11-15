"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import {
  useCategories,
  useAllCategoryProducts,
  useAllCategoryProductsPaginated,
  useCategoryProducts,
} from "@/features/category/hooks/useCategories";
import { notFound } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  // Fetch all categories first
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  // Find category from slug
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

  // Track subcategories
  const [hasSubcategories, setHasSubcategories] = useState(false);
  const [subcategoriesToShow, setSubcategoriesToShow] = useState<Category[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Price sorting state
  const [priceSort, setPriceSort] = useState<"none" | "lowToHigh" | "highToLow">("none");

  // Price filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Selected filters state
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<number>>>({
    brand: new Set(),
    color: new Set(),
    tag: new Set(),
  });

  // Determine if category is a subcategory
  const isSubCategory = useMemo(() => {
    if (!categoriesData || !selectedCategory) return false;

    const checkIsSubCategory = (categories: Category[], targetId: number): boolean => {
      for (const category of categories) {
        if (category.children) {
          for (const subCategory of category.children) {
            if (subCategory.id === targetId) return true;
            if (subCategory.children) {
              const foundInNested = checkIsSubCategory([subCategory], targetId);
              if (foundInNested) return true;
            }
          }
        }
      }
      return false;
    };

    return checkIsSubCategory(categoriesData, selectedCategory.id);
  }, [categoriesData, selectedCategory]);

  // Fetch initial products for subcategories (first page only)
  const { data: subcategoryProducts = [], isLoading: subcategoryLoading } =
    useAllCategoryProducts(selectedCategory || undefined, {
      enabled: !!selectedCategory && isSubCategory && currentPage === 1,
    });

  // Fetch paginated subcategory products (page 2+)
  const {
    data: paginatedSubcategoryData,
    isLoading: subcategoryPaginatedLoading,
  } = useAllCategoryProductsPaginated(selectedCategory || undefined, {
    enabled: !!selectedCategory && isSubCategory && currentPage > 1,
    page: currentPage,
    limit: 6,
  });

  // Fetch paginated category products (for non-subcategories)
  const {
    data: paginatedCategoryData,
    isLoading: categoryPaginatedLoading,
    isFetching: categoryPaginatedFetching,
  } = useCategoryProducts(selectedCategory?.id?.toString() || "", {
    enabled: !!selectedCategory && !isSubCategory,
    page: currentPage,
    limit: 6,
  });

 

  if (!slug) {
    notFound();
  }

  // Helper function to find category by ID
  const findCategoryById = (
    categories: Category[] | undefined,
    id: number
  ): Category | null => {
    if (!categories) return null;

    for (const category of categories) {
      if (category.id === id) return category;
      if (category.children) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to check if product already exists in list
  const isProductInList = (list: Product[], newProduct: Product) => {
    return list.some((product) => product.id === newProduct.id);
  };

  // Setup subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      // Reset states
      setAllProducts([]);
      setHasMore(true);
      setCurrentPage(1);

      // Set subcategories
      if (selectedCategory.children && selectedCategory.children.length > 0) {
        setHasSubcategories(true);
        setSubcategoriesToShow(selectedCategory.children);
      } else {
        setHasSubcategories(false);
        setSubcategoriesToShow([]);
      }
    }
  }, [selectedCategory?.id]);

  // Handle first page products for subcategories
  useEffect(() => {
    if (
      selectedCategory &&
      isSubCategory &&
      subcategoryProducts.length > 0 &&
      currentPage === 1
    ) {
      console.log("Setting subcategory products:", subcategoryProducts.length);
      setAllProducts(subcategoryProducts);
      setHasMore(true);
    }
  }, [selectedCategory, subcategoryProducts, currentPage, isSubCategory]);

  // Handle paginated category products (non-subcategories) - FIXED
  useEffect(() => {
    if (paginatedCategoryData && selectedCategory && !isSubCategory) {
      console.log("Paginated category data:", paginatedCategoryData);

      if (paginatedCategoryData.data && paginatedCategoryData.data.length > 0) {
        setAllProducts((prevProducts) => {
          if (currentPage === 1) {
            return [...paginatedCategoryData.data];
          }

          const newProducts = paginatedCategoryData.data.filter(
            (newProduct: Product) => !isProductInList(prevProducts, newProduct)
          );

          return [...prevProducts, ...newProducts];
        });

        // FIXED: Check next_page_url instead of pagination object existence
        setHasMore(!!paginatedCategoryData.pagination?.next_page_url);
      } else if (currentPage === 1) {
        setAllProducts([]);
        setHasMore(false);
      }
    }
  }, [paginatedCategoryData, currentPage, selectedCategory, isSubCategory]);

  // Handle paginated subcategory products
  useEffect(() => {
    if (
      paginatedSubcategoryData &&
      selectedCategory &&
      isSubCategory &&
      currentPage > 1
    ) {
      console.log("Paginated subcategory data:", paginatedSubcategoryData);

      if (
        paginatedSubcategoryData.data &&
        paginatedSubcategoryData.data.length > 0
      ) {
        setAllProducts((prevProducts) => {
          const newProducts = paginatedSubcategoryData.data.filter(
            (newProduct: Product) => !isProductInList(prevProducts, newProduct)
          );

          return [...prevProducts, ...newProducts];
        });

        setHasMore(paginatedSubcategoryData.pagination?.hasMorePages || false);
      } else {
        setHasMore(false);
      }
    }
  }, [paginatedSubcategoryData, currentPage, selectedCategory, isSubCategory]);

  const loadMoreData = useCallback(() => {
    if (!hasMore || categoryPaginatedFetching || subcategoryPaginatedLoading) {
      console.log("Cannot load more:", { hasMore, categoryPaginatedFetching, subcategoryPaginatedLoading });
      return;
    }
    console.log("Loading more, current page:", currentPage, "next page:", currentPage + 1);
    setCurrentPage((prevPage) => prevPage + 1);
  }, [hasMore, categoryPaginatedFetching, subcategoryPaginatedLoading, currentPage]);

  const isLoading =
    categoriesLoading ||
    (subcategoryLoading && currentPage === 1) ||
    (categoryPaginatedLoading && currentPage === 1);

  const products = useMemo(() => {
    let productsList = [...allProducts];

    if (priceSort === "lowToHigh") {
      return [...productsList].sort(
        (a, b) =>
          parseFloat(a.price_amount || "0") - parseFloat(b.price_amount || "0")
      );
    } else if (priceSort === "highToLow") {
      return [...productsList].sort(
        (a, b) =>
          parseFloat(b.price_amount || "0") - parseFloat(a.price_amount || "0")
      );
    }

    return productsList;
  }, [priceSort, allProducts]);

  const totalItems = useMemo(() => {
    if (
      paginatedCategoryData?.pagination &&
      !isSubCategory &&
      selectedCategory
    ) {
      return paginatedCategoryData.pagination.total || products.length || 0;
    }
    return products.length || 0;
  }, [paginatedCategoryData, products, isSubCategory, selectedCategory]);

  const handlePriceSortChange = (sortType: "none" | "lowToHigh" | "highToLow") => {
    setPriceSort(sortType);
  };

  const handleSubCategorySelect = (subCategory: Category) => {
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setPriceSort("none");

    router.push(`/${locale}/category/${subCategory.slug}`, { scroll: false });
  };

  const handleCategoryClick = (category: Category) => {
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    router.push(`/${locale}/category/${category.slug}`);
  };

  const renderBreadcrumbs = () => {
    if (!categoriesData || !selectedCategory) return null;

    const breadcrumbs: Category[] = [];
    let currentCategory = selectedCategory;
    let parentId = currentCategory.parent_id;

    breadcrumbs.unshift(currentCategory);

    while (parentId) {
      const parentCategory = findCategoryById(categoriesData, parentId);
      if (parentCategory) {
        breadcrumbs.unshift(parentCategory);
        parentId = parentCategory.parent_id;
      } else {
        break;
      }
    }

    return (
      <div className="flex items-center gap-2 mb-4 text-sm">
        {breadcrumbs.map((category, index) => (
          <div key={category.id} className="flex items-center gap-2">
            <button
              onClick={() => handleCategoryClick(category)}
              className="hover:text-primary transition-colors"
            >
              {category.name}
            </button>
            {index < breadcrumbs.length - 1 && <span>/</span>}
          </div>
        ))}
      </div>
    );
  };

  const pageTitle = selectedCategory?.name || t("category");

  const handleFilterChange = (key: string, value: number) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[key]) {
        newFilters[key] = new Set();
      }

      if (newFilters[key].has(value)) {
        newFilters[key].delete(value);
      } else {
        newFilters[key].add(value);
      }

      return newFilters;
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handlePriceInputChange = (type: "from" | "to", value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === "from") {
      setPriceRange([numValue, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      brand: new Set(),
      color: new Set(),
      tag: new Set(),
    });
    setPriceRange([0, 10000]);
    setPriceSort("none");
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {hasSubcategories && subcategoriesToShow.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">{t("subcategories")}</h3>
          <div className="space-y-1">
            {subcategoriesToShow.map((subCategory) => (
              <button
                key={subCategory.id}
                onClick={() => handleSubCategorySelect(subCategory)}
                className={`w-full text-left py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  slug === subCategory.slug
                    ? "text-primary font-medium bg-gray-50"
                    : ""
                }`}
              >
                {subCategory.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">{t("composition")}</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={priceSort === "none"}
              onChange={() => handlePriceSortChange("none")}
              className="w-4 h-4"
            />
            <span>{t("neverMind")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={priceSort === "lowToHigh"}
              onChange={() => handlePriceSortChange("lowToHigh")}
              className="w-4 h-4"
            />
            <span>{t("fromCheapToExpensive")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={priceSort === "highToLow"}
              onChange={() => handlePriceSortChange("highToLow")}
              className="w-4 h-4"
            />
            <span>{t("fromExpensiveToHigh")}</span>
          </label>
        </div>
      </div>

      <PriceFilter
        title={t("price")}
        priceRange={priceRange}
        onPriceChange={handlePriceChange}
        onInputChange={handlePriceInputChange}
        translations={{ from: t("from"), to: t("to") }}
      />

      <Button
        variant="outline"
        className="w-full rounded-xl bg-transparent"
        onClick={resetFilters}
      >
      {t("reset")}
      </Button>
    </div>
  );

  if (isLoading) return <div>{t("loading") || "Ýüklenýär..."}</div>;

  if (!selectedCategory && !categoriesLoading) {
    return <div className="text-center py-8">Bölüm tapylmady</div>;
  }

  console.log(
    "Current state - products:",
    products.length,
    "hasMore:",
    hasMore,
    "page:",
    currentPage,
    "isFetching:",
    categoryPaginatedFetching
  );

  return (
    <div className="flex flex-col gap-4">
      {selectedCategory && renderBreadcrumbs()}
      <h2 className="text-3xl font-bold">{pageTitle}</h2>
      <p className="text-gray-600">
        {t("total")}: {totalItems} {t("items")}
      </p>

      <div className="flex gap-4">
        {/* Desktop Filters - LEFT SIDE */}
        <div className="hidden sm:block w-[280px] flex-shrink-0 border-r pr-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <FiltersContent />
          </ScrollArea>
        </div>

        {/* Content - RIGHT SIDE */}
        <div className="flex-1">
          {products.length > 0 ? (
            <InfiniteScroll
              dataLength={products.length}
              next={loadMoreData}
              hasMore={hasMore}
              scrollThreshold={0.8}
              style={{ overflow: "visible" }}
              loader={
                <div className="flex justify-center py-4">
                  <div>Ýüklenýär...</div>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
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
                    is_favorite={false}
                  />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <div className="text-center py-8 text-gray-500">{t("nResults")}</div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet */}
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
              <span className="sr-only">Ýap</span>
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
  onInputChange,
  translations,
}: {
  title: string;
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  onInputChange: (type: "from" | "to", value: string) => void;
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
              onChange={(e) => onInputChange("from", e.target.value)}
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
              onChange={(e) => onInputChange("to", e.target.value)}
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