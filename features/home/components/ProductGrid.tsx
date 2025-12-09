"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/features/home/components/ProductCard";
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

  useEffect(() => {
    if (!isLoading && productsData) {
      const hasProducts = productsData.data && productsData.data.length > 0;
      setShouldRender(hasProducts);
    }
  }, [isLoading, productsData]);

  if (!isLoading && (!productsData?.data || productsData.data.length === 0)) {
    return null;
  }

  const handleTitleClick = () => {
    router.push(`/${locale}/collections/${collection.id}`);
  };

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

  if (isError) {
    return null;
  }

  const displayProducts = productsData?.data.slice(0, 10) || [];

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
            />
          );
        })}
      </div>
    </section>
  );
}
