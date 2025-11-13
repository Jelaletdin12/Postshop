"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import CartItemCard from "./ui/CartItemCard"
import OrderSummary from "./ui/OrderSummary"
import { useCart, useCreateOrder, useRegions, useAddresses, usePaymentTypes } from "@/lib/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { DeliveryType, PaymentTypeOption } from "./ui/types"

export default function CartPage() {
  const [isClient, setIsClient] = useState(false)
  const [paymentType, setPaymentType] = useState<PaymentTypeOption | null>(null)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("SELECTED_DELIVERY")
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const router = useRouter()

  const t = useTranslations()

  // useCart dönen data yapısı: { message: "success", data: [...] }
  const { data: cartResponse, isLoading, isError } = useCart()
  const { data: regions = [] } = useRegions()
  const { data: addresses = [] } = useAddresses()
  const { data: paymentTypes = [] } = usePaymentTypes()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()

  // Cart items'ı doğru şekilde al
  const cartItems = cartResponse?.data || []

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDeliveryTypeChange = (type: DeliveryType) => {
    setDeliveryType(type)
    setSelectedAddress("")
  }

  const handleCompleteOrder = () => {
    if (!selectedRegion || !selectedAddress || !paymentType) {
      console.warn("Missing required fields for order")
      return
    }

    createOrder(
      {
        customer_address: selectedAddress,
        shipping_method: deliveryType === "PICK_UP" ? "pickup" : "standart",
        payment_type_id: paymentType.id,
        region: selectedRegion,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/orders`)
        },
      },
    )
  }

  if (!isClient) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 min-h-[90vh] flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    )
  }

  if (isError || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 min-h-[90vh] flex items-center justify-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-400 font-semibold">
          {t("emptyCart") || "Your cart is empty"}
        </h2>
      </div>
    )
  }

  const translations = {
    cart: t("cart"),
    ordersIn: t("order_available_in_shops"),
    pricePerUnit: t("unit_price"),
    additionalPrice: t("extra_price"),
    discount: t("discount"),
    totalPrice: t("total_price"),
    paymentType: t("payment_type"),
    cash: t("cash"),
    card: t("card"),
    deliveryType: t("delivery_type"),
    delivery: t("delivery"),
    pickup: t("pickup"),
    selectRegion: t("choose_region"),
    selectAddress: t("choose_address"),
    note: t("note"),
    placeOrder: t("order"),
    emptyCart: t("cart_empty"),
    map: t("address"),
  }

  // Group items by seller (from channel)
  const itemsBySeller = cartItems.reduce(
    (acc, item) => {
      const sellerId = item.product.channel?.[0]?.id || 0
      const sellerName = item.product.channel?.[0]?.name || "Unknown Seller"
      
      if (!acc[sellerId]) {
        acc[sellerId] = { 
          seller: { id: sellerId, name: sellerName }, 
          items: [] 
        }
      }
      acc[sellerId].items.push(item)
      return acc
    },
    {} as Record<number, { seller: any; items: typeof cartItems }>
  )

  // Calculate total
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product.price_amount || "0")
    return sum + (price * item.product_quantity)
  }, 0)

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{translations.cart}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cart Items Section */}
        <div className="flex-1">
          <Card className="p-6 rounded-xl">
            {/* Sellers */}
            {Object.entries(itemsBySeller).map(([sellerId, { seller, items }]) => (
              <div key={sellerId} className="mb-6">
                <p className="text-base font-semibold mb-3">{seller.name}</p>
                <div className="space-y-4">
                  {items.map((item) => {
                    const price = parseFloat(item.product.price_amount || "0")
                    const quantity = item.product_quantity
                    const total = price * quantity
                    
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
                            image: item.product.media?.[0]?.images_800x800 || item.product.media?.[0]?.thumbnail,
                            images: item.product.media?.map(m => m.images_800x800 || m.thumbnail) || []
                          }
                        }} 
                        translations={translations} 
                      />
                    )
                  })}
                </div>
                {Object.entries(itemsBySeller).length > 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <OrderSummary
          order={{
            id: 1,
            seller: { id: 1, name: "Store" },
            items: cartItems.map(item => ({
              ...item,
              quantity: item.product_quantity,
              price: parseFloat(item.product.price_amount || "0"),
              total: parseFloat(item.product.price_amount || "0") * item.product_quantity,
              seller: { 
                id: item.product.channel?.[0]?.id || 0, 
                name: item.product.channel?.[0]?.name || "Unknown" 
              }
            })),
            billing: {
              body: [
                { 
                  title: t("goods"), 
                  value: `${totalAmount.toFixed(2)} TMT`
                }
              ],
              footer: { 
                title: t("total"), 
                value: `${totalAmount.toFixed(2)} TMT`
              },
            },
          }}
          translations={translations}
          paymentType={paymentType}
          deliveryType={deliveryType}
          selectedRegion={selectedRegion}
          selectedAddress={selectedAddress}
          note={note}
          regions={regions}
          addresses={addresses}
          paymentTypes={paymentTypes}
          onPaymentTypeChange={setPaymentType}
          onDeliveryTypeChange={handleDeliveryTypeChange}
          onRegionChange={setSelectedRegion}
          onAddressChange={setSelectedAddress}
          onNoteChange={setNote}
          onMapOpen={() => {}}
          onCompleteOrder={handleCompleteOrder}
          isLoading={isCreatingOrder}
        />
      </div>
    </div>
  )
}