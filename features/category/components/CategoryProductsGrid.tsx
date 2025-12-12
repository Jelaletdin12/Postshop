import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/features/home/components/ProductCard";
import type { Product } from "@/lib/types/api";

interface CategoryProductsGridProps {
  products: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  translations: {
    loading: string;
    no_results: string;
  };
}

export default function CategoryProductsGrid({
  products,
  hasMore,
  onLoadMore,
  translations,
}: CategoryProductsGridProps) {
  if (products.length === 0) {
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
          <div>{translations.loading}</div>
        </div>
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
    </InfiniteScroll>
  );
}