import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface ProductProperty {
  name: string;
  value: string;
}

interface ProductInfoCardProps {
  name: string;
  brandName?: string;
  stock?: number;
  barcode?: string;
  colour?: string;
  properties?: ProductProperty[];
  description?: string;
  averageRating: number;
  reviewsCount: number;
  t: (key: string, params?: any) => string;
}

export function ProductInfoCard({
  name,
  brandName,
  stock,
  barcode,
  colour,
  properties,
  description,
  averageRating,
  reviewsCount,
  t,
}: ProductInfoCardProps) {
  return (
    <div className="flex-1 space-y-6 bg-white">
      <Card className="p-4 rounded-xl border-gray-200">
        <h3 className="text-xl font-semibold mb-4">{name}</h3>
        <div className="space-y-3">
          {brandName && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">{t("brands")}</span>
                <span className="font-medium">{brandName}</span>
              </div>
              <Separator />
            </>
          )}

          {/* {stock !== undefined && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">{t("stock")}</span>
                <span
                  className={`font-medium ${
                    stock === 0
                      ? "text-red-500"
                      : stock <= 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {stock === 0
                    ? t("out_of_stock")
                    : stock <= 5
                    ? `${t("only_left", { count: stock })}`
                    : stock}
                </span>
              </div>
              <Separator />
            </>
          )}

          {barcode && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">{t("barcode")}</span>
                <span className="font-mono text-sm">{barcode}</span>
              </div>
              <Separator />
            </>
          )} */}

          {colour && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">{t("color")}</span>
                <span className="font-medium">{colour}</span>
              </div>
              <Separator />
            </>
          )}

          {properties && properties.length > 0 && (
            <>
              {properties.map(
                (prop, idx) =>
                  prop.value && (
                    <div key={idx}>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500">{prop.name}</span>
                        <span className="font-medium">{prop.value}</span>
                      </div>
                      {idx < properties.length - 1 && <Separator />}
                    </div>
                  )
              )}
            </>
          )}
        </div>
      </Card>

      {description && (
        <Card className="p-4 rounded-xl border-gray-200 gap-2">
          <h3 className="text-xl font-semibold mb-3">
            {t("product_description")}
          </h3>
          <div
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Card>
      )}
    </div>
  );
}
