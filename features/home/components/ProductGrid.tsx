"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollectionProducts } from "@/lib/hooks";
import type { Collection } from "@/lib/types/api";

type Props = {
  collection: Collection;
  locale: string;
};

export default function CollectionSection({ collection, locale }: Props) {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(true);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useCollectionProducts(collection.id, { enabled: shouldRender });

  // Determine if section should render based on products
  useEffect(() => {
    if (!isLoading && productsData) {
      const hasProducts = productsData.data && productsData.data.length > 0;
      setShouldRender(hasProducts);
    }
  }, [isLoading, productsData]);

  // Don't render if no products after loading
  if (!isLoading && (!productsData?.data || productsData.data.length === 0)) {
    return null;
  }

  const handleTitleClick = () => {
    router.push(`/${locale}/collections/${collection.id}`);
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return null; // Silently skip errored collections
  }

  // Slice to show only first 4 products
  const displayProducts = productsData?.data.slice(0, 4) || [];

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer group"
        onClick={handleTitleClick}
      >
        <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
          {collection.name}
        </h2>
        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {displayProducts.map((product) => {
          // Extract first media image or use placeholder
          const firstImage =
            product.media?.[0]?.images_800x800 ||
            product.media?.[0]?.images_720x720 ||
            product.media?.[0]?.thumbnail ||
            "/placeholder-product.jpg";

          // Format price
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
              images={[firstImage]}
              is_favorite={false}
              labels={[]}
              price_color="#111"
              height={360}
              width={250}
              button={false}
            />
          );
        })}
      </div>
    </section>
  );
}
