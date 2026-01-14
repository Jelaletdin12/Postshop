"use client";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItemCard from "../../../features/cart/components/CartItemCard";
import CartItemSkeleton from "../../../features/cart/components/CartItemSkeleton";
import OrderSummary from "../../../features/cart/components/OrderSummary";
import OrderSummarySkeleton from "../../../features/cart/components/OrderSummarySkeleton";
import {
  useCart,
  useCreateOrder,
  useRegions,
  usePaymentTypes,
} from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { DeliveryType, PaymentType } from "@/lib/types/api";
import EmptyCart from "@/features/cart/components/EmptyCart";
import ErrorPage from "@/components/ErrorPage";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("SELECTED_DELIVERY");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");
  const [phone, setPhone] = useState<string>("+993 "); 
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const router = useRouter();
  const t = useTranslations();

  const { data: cartResponse, isLoading: cartLoading, isError } = useCart();
  const { data: provinces = [], isLoading: provincesLoading } = useRegions();
  const { data: paymentTypes = [], isLoading: paymentTypesLoading } =
    usePaymentTypes();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const cartItems = cartResponse?.data || [];
  const isLoading = cartLoading || provincesLoading || paymentTypesLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const regionGroups = useMemo(() => {
    return provinces.reduce((acc, province) => {
      if (!acc[province.region]) {
        acc[province.region] = [];
      }
      acc[province.region].push(province);
      return acc;
    }, {} as Record<string, typeof provinces>);
  }, [provinces]);

  const availableRegions = useMemo(
    () => Object.keys(regionGroups),
    [regionGroups]
  );

  const itemsBySeller = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const sellerId = item.product.channel?.[0]?.id || 0;
      const sellerName = item.product.channel?.[0]?.name || "Unknown Seller";

      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: { id: sellerId, name: sellerName },
          items: [],
        };
      }
      acc[sellerId].items.push(item);
      return acc;
    }, {} as Record<number, { seller: { id: number; name: string }; items: typeof cartItems }>);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price_amount || "0");
      return sum + price * item.product_quantity;
    }, 0);
  }, [cartItems]);

  const handleDeliveryTypeChange = (type: DeliveryType) => {
    setDeliveryType(type);
    setSelectedProvince(null);
  };

 
  const formatPhoneForBackend = (phoneNumber: string): string => {
   
    return phoneNumber.replace(/^\+993\s*/, "").replace(/\s+/g, "");
  };

  const handleCompleteOrder = () => {
  if (!selectedRegion || !selectedProvince || !paymentType || !phone || !name) {
    console.warn("Missing required fields for order");
    return;
  }

  const phoneDigits = formatPhoneForBackend(phone);
  if (phoneDigits.length !== 8) {
    console.warn("Phone number must be exactly 8 digits");
    return;
  }

  const selectedProvinceData = provinces.find((p) => p.id === selectedProvince);
  if (!selectedProvinceData) return;

  createOrder(
    {
      customer_name: `${name} ${lastName}`.trim(),
      customer_phone: parseInt(phoneDigits, 10), 
      customer_address: selectedProvinceData.name,
      shipping_method: "standart",
      payment_type_id: paymentType.id,
      region: selectedRegion,
      note: note || undefined,
    },
    {
      onSuccess: () => {
        router.push(`/orders`);
      },
    }
  );
};

  if (!isClient) return null;

  if (isLoading) {
    return (
      <div className="mx-auto px-2 md:px-4 lg:px-6 mb-18">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 pt-3">
          {t("cart")}
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Card className="p-4 md:p-6 rounded-xl">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
            </Card>
          </div>
          <OrderSummarySkeleton />
        </div>
      </div>
    );
  }
  
  if (isError ) {
    return <ErrorPage />;
  }
  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="flex flex-col mx-auto max-w-[1504px] px-2 md:px-4 lg:px-6 mb-18">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 pt-3">
        {t("cart")}
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Card className="p-4 md:p-6 rounded-xl">
            {Object.entries(itemsBySeller).map(
              ([sellerId, { seller, items }]) => (
                <div key={sellerId} className="mb-6">
                  <p className="text-base font-semibold mb-3">{seller.name}</p>
                  <div className="space-y-4">
                    {items.map((item) => {
                      const price = parseFloat(
                        item.product.price_amount || "0"
                      );
                      const quantity = item.product_quantity;
                      const total = price * quantity;

                      return (
                        <CartItemCard
                          key={item.id}
                          item={{
                            ...item,
                            quantity: quantity,
                            price: price,
                            total: total,
                            seller: seller,
                            price_formatted: `${item.product.price_amount} TMT`,
                            sub_total_formatted: `${item.product.price_amount} TMT`,
                            total_formatted: `${total.toFixed(2)} TMT`,
                            discount_formatted: "0 TMT",
                            product: {
                              ...item.product,
                              image:
                                item.product.media?.[0]?.images_800x800 ||
                                item.product.media?.[0]?.thumbnail,
                              images:
                                item.product.media?.map(
                                  (m) => m.images_800x800 || m.thumbnail
                                ) || [],
                            },
                          }}
                        />
                      );
                    })}
                  </div>
                  {Object.entries(itemsBySeller).length > 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              )
            )}
          </Card>
        </div>

        <OrderSummary
          order={{
            id: 1,
            billing: {
              body: [
                {
                  title: t("products"),
                  value: `${totalAmount.toFixed(2)} TMT`,
                },
              ],
              footer: {
                title: t("total_price"),
                value: `${totalAmount.toFixed(2)} TMT`,
              },
            },
          }}
          paymentType={paymentType}
          deliveryType={deliveryType}
          selectedRegion={selectedRegion}
          selectedProvince={selectedProvince}
          note={note}
          regionGroups={regionGroups}
          availableRegions={availableRegions}
          paymentTypes={paymentTypes}
          phone={phone}
          name={name}
          lastName={lastName}
          onPhoneChange={setPhone}
          onNameChange={setName}
          onLastNameChange={setLastName}
          onPaymentTypeChange={setPaymentType}
          onDeliveryTypeChange={handleDeliveryTypeChange}
          onRegionChange={setSelectedRegion}
          onProvinceChange={setSelectedProvince}
          onNoteChange={setNote}
          onCompleteOrder={handleCompleteOrder}
          isLoading={isCreatingOrder}
        />
      </div>
    </div>
  );
}