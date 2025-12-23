"use client";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/features/home/components/ProductCard";
import { useCollectionProducts } from "@/features/collections/hooks/useCollections";
import type { Collection } from "@/lib/types/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  collection: Collection;
  locale: string;
};

export default function CollectionSection({ collection, locale }: Props) {
  const router = useRouter();
  const {
    data: productsData,
    isLoading,
    isError,
  } = useCollectionProducts(collection.id);

  const handleTitleClick = () => {
    router.push(`/collections/${collection.slug}`);
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full h-[260px] rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-2" />
              <Skeleton className="h-6 w-1/2 mx-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) return null;

  // Hide section if no products
  if (!productsData?.data || productsData.data.length === 0) {
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
              (m) =>
                m.images_800x800 ||
                m.images_720x720 ||
                m.images_400x400 ||
                m.thumbnail
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