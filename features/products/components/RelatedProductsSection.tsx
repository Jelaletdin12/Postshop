import ProductCard from "@/features/home/components/ProductCard";
import {useTranslations} from "next-intl";
interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  price_amount: string;
  old_price_amount?: string;
  struct_price_text: string;
  discount?: number | null;
  discount_text?: string | null;
  stock?: number;
  media: Array<{
    images_800x800?: string;
    images_720x720?: string;
    images_400x400?: string;
    thumbnail: string;
  }>;
  labels?: Array<{
    text: string;
    bg_color: string;
  }>;
  price_color?: string;
}

interface RelatedProductsSectionProps {
  products: RelatedProduct[];
}

export function RelatedProductsSection({
  products,
}: RelatedProductsSectionProps) {
  const t = useTranslations();
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t("related_products")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => {
          // Extract image URLs from media
          const images =
            product.media?.map(
              (m) =>
                m.images_800x800 ||
                m.images_720x720 ||
                m.images_400x400 ||
                m.thumbnail
            ) || [];

          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={parseFloat(product.price_amount) || null}
              struct_price_text={
                product.struct_price_text || `${product.price_amount} TMT`
              }
              discount={product.discount}
              discount_text={product.discount_text}
              images={images}
              labels={product.labels || []}
              price_color={product.price_color}
              height={360}
              width={280}
              button={true}
              stock={product.stock}
            />
          );
        })}
      </div>
    </div>
  );
}
