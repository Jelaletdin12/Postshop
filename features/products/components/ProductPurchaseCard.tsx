import Link from "next/link";
import { Minus, Plus, Heart, ShoppingCart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProductPurchaseCardProps {
  price: string;
  oldPrice?: string;
  isInCart: boolean;
  localQuantity: number;
  availableStock: number;
  isSyncing: boolean;
  syncError: boolean;
  isFavorite: boolean;
  productStock: number;
  channelName?: string;
  onAddToCart: () => void;
  onQuantityIncrease: () => void;
  onQuantityDecrease: () => void;
  onToggleFavorite: () => void;
  t: (key: string) => string;
}

export function ProductPurchaseCard({
  price,
  oldPrice,
  isInCart,
  localQuantity,
  availableStock,
  isSyncing,
  syncError,
  isFavorite,
  productStock,
  channelName,
  onAddToCart,
  onQuantityIncrease,
  onQuantityDecrease,
  onToggleFavorite,
  t,
}: ProductPurchaseCardProps) {
  return (
    <div className="lg:w-[380px] space-y-4">
      <Card className="p-6 rounded-xl">
        <div className="flex justify-between items-start mb-6">
          <span className="text-lg text-gray-500">{t("price")}:</span>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-primary">
              {price} TMT
            </span>
            {oldPrice && parseFloat(oldPrice) > 0 && (
              <span className="text-lg text-gray-400 line-through">
                {oldPrice} TMT
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {isInCart ? (
            <>
              <Link href="/cart">
                <Button
                  size="lg"
                  className="w-full rounded-lg cursor-pointer text-lg font-bold bg-green-600 hover:bg-green-700 mb-4"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t("go_to_cart")}
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onQuantityDecrease}
                  disabled={isSyncing}
                  className={`rounded-lg cursor-pointer h-12 w-12 ${
                    isSyncing ? "opacity-70" : ""
                  }`}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="flex-1 text-center font-semibold text-xl border rounded-xl h-12 flex items-center justify-center relative">
                  {localQuantity}
                  {syncError && (
                    <span
                      className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"
                      title="Sync error"
                    />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onQuantityIncrease}
                  disabled={isSyncing}
                  className={`rounded-lg cursor-pointer h-12 w-12 ${
                    isSyncing ? "opacity-70" : ""
                  }`}
                >
                  <Plus className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleFavorite}
                  className={`rounded-lg h-12 w-12 transition-all border cursor-pointer ${
                    isFavorite
                      ? "bg-[#F0F8FF] border-blue-300 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    className={`h-6! w-6! transition-all ${
                      isFavorite
                        ? "fill-[#005bff] text-[#005bff]"
                        : "text-[#005bff]"
                    }`}
                  />
                </Button>
              </div>
            </>
          ) : (
            <Button
              size="lg"
              onClick={onAddToCart}
              disabled={isSyncing || productStock === 0}
              className="w-full rounded-lg  text-lg font-bold bg-[#005bff] hover:bg-[#0041c4] cursor-pointer"
            >
              {isSyncing ? (
                <>
                  
                  {t("adding")}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {productStock === 0 ? t("out_of_stock") : t("add_to_cart")}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {channelName && (
        <Card className="p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-14 h-14 bg-primary/10">
              <AvatarFallback className="bg-transparent">
                <Store className="h-6 w-6 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-500">{t("store")}</p>
              <h4 className="text-lg font-bold">{channelName}</h4>
            </div>
          </div>
          <Button variant="outline" size="lg" className="w-full cursor-pointer rounded-lg">
            {t("write_to_store")}
          </Button>
        </Card>
      )}
    </div>
  );
}