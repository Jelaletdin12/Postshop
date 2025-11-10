"use client"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useUpdateCartItemQuantity, useRemoveFromCart } from "@/lib/hooks"
import type { CartItem, CartTranslations } from "./types"

interface CartItemCardProps {
  item: CartItem
  translations: CartTranslations
}

export default function CartItemCard({ item, translations: t }: CartItemCardProps) {
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateCartItemQuantity()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart()

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta
    if (newQuantity >= 1) {
      updateQuantity({ itemId: item.id, quantity: newQuantity })
    }
  }

  const handleDelete = () => {
    removeItem(item.id)
  }

  return (
    <Card className="p-4 shadow-none border">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image & Info */}
        <div className="flex gap-4 flex-1">
          <div className="relative w-[88px] h-[117px] rounded-xl border overflow-hidden flex-shrink-0">
            <Image
              src={item.product.image || item.product.images[0] || "/placeholder.svg"}
              alt={item.product.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base">{item.product.name}</h3>
            <p className="text-sm text-gray-600">{item.seller.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isRemoving}
              className="w-fit p-0 h-auto hover:bg-transparent hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {t.pricePerUnit} <span className="text-primary">{item.price_formatted || `${item.price} TMT`}</span>
            </p>
            <p className="text-sm font-semibold">
              {t.additionalPrice} {item.sub_total_formatted || `${item.total} TMT`}
            </p>
            {item.discount_formatted && item.discount_formatted !== "0 TMT" && (
              <p className="text-sm font-semibold">
                {t.discount} {item.discount_formatted}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t.totalPrice}</span>
              <span className="bg-green-500 text-white px-3 py-1 rounded-xl font-semibold text-base">
                {item.total_formatted || `${item.total} TMT`}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity === 1 || isUpdating}
              className="rounded-xl bg-blue-50"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-12 text-center font-semibold">{item.quantity}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={isUpdating}
              className="rounded-xl bg-blue-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
