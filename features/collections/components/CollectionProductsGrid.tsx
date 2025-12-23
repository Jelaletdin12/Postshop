import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/features/home/components/ProductCard";
import type { Product } from "@/lib/types/api";

interface CollectionProductsGridProps {
  products: Product[];
  hasMore: boolean;
  isFetching?: boolean;
  onLoadMore: () => void;
  translations: {
    loading: string;
    no_results: string;
  };
}

export default function CollectionProductsGrid({
  products,
  hasMore,
  onLoadMore,
  isFetching = false,
  translations,
}: CollectionProductsGridProps) {
  if (products.length === 0 && !isFetching) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.no_results}
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={onLoadMore}
      hasMore={hasMore}
      scrollThreshold={0.8}
      style={{ overflow: "visible" }}
      loader={
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>{translations.loading}</span>
          </div>
        </div>
      }
      endMessage={
        products.length > 0 && !hasMore ? (
          <div className="text-center py-4 text-gray-500 text-sm"></div>
        ) : null
      }
    >
      <div className="bg-white rounded-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={
              product.price_amount ? parseFloat(product.price_amount) : null
            }
            struct_price_text={`${product.price_amount} TMT`}
            images={[product.media?.[0]?.images_400x400]}
            stock={product.stock}
            button={true}
          />
        ))}
      </div>

      {isFetching && products.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-2" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}
    </InfiniteScroll>
  );
}
