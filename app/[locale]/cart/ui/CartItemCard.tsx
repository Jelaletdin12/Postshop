"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  useUpdateCartItemQuantity, 
  useRemoveFromCart 
} from "@/lib/hooks"
import type { CartItem, CartTranslations } from "./types"

interface CartItemCardProps {
  item: CartItem
  translations: CartTranslations
  onUpdate?: () => void
}

export default function CartItemCard({ 
  item, 
  translations: t,
  onUpdate 
}: CartItemCardProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity)
  const [pendingQuantity, setPendingQuantity] = useState(item.quantity)
  const [isLoading, setIsLoading] = useState(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  const { mutate: updateQuantity } = useUpdateCartItemQuantity()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart()

  // Sync local quantity with server quantity
  useEffect(() => {
    setLocalQuantity(item.quantity)
    setPendingQuantity(item.quantity)
  }, [item.quantity])

  // Debounced update effect
  useEffect(() => {
    if (pendingQuantity === item.quantity) {
      return
    }

    // Clear previous timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Set new timeout for update
    updateTimeoutRef.current = setTimeout(() => {
      setIsLoading(true)

      if (pendingQuantity <= 0) {
        removeItem(item.id, {
          onSuccess: () => {
            onUpdate?.()
          },
          onError: (error) => {
            console.error("Failed to remove item:", error)
            // Revert on error
            setLocalQuantity(item.quantity)
            setPendingQuantity(item.quantity)
          },
          onSettled: () => {
            setIsLoading(false)
          },
        })
      } else {
        updateQuantity(
          { itemId: item.id, quantity: pendingQuantity },
          {
            onSuccess: () => {
              onUpdate?.()
            },
            onError: (error) => {
              console.error("Failed to update quantity:", error)
              // Revert on error
              setLocalQuantity(item.quantity)
              setPendingQuantity(item.quantity)
            },
            onSettled: () => {
              setIsLoading(false)
            },
          }
        )
      }
    }, 300)

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [pendingQuantity, item.quantity, item.id, updateQuantity, removeItem, onUpdate])

  const handleQuantityIncrease = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    const newQuantity = localQuantity + 1
    setLocalQuantity(newQuantity)
    setPendingQuantity(newQuantity)
  }

  const handleQuantityDecrease = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    const newQuantity = localQuantity - 1

    if (newQuantity < 1) {
      handleDelete()
      return
    }

    setLocalQuantity(newQuantity)
    setPendingQuantity(newQuantity)
  }

  const handleDelete = () => {
    setIsLoading(true)
    removeItem(item.id, {
      onSuccess: () => {
        onUpdate?.()
      },
      onError: (error) => {
        console.error("Failed to remove item:", error)
      },
      onSettled: () => {
        setIsLoading(false)
      },
    })
  }

  const getImageSrc = () => {
    if (item.product.image) return item.product.image
    if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0]
    }
    return "/placeholder.svg"
  }

  return (
    <Card className="p-4 shadow-none border">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image & Info */}
        <div className="flex gap-4 flex-1">
          <div className="relative w-[88px] h-[117px] rounded-xl border overflow-hidden flex-shrink-0">
            <Image
              src={getImageSrc()}
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
              disabled={isRemoving || isLoading}
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
              {t.pricePerUnit}{" "}
              <span className="text-primary">
                {item.price_formatted || `${item.price} TMT`}
              </span>
            </p>
            <p className="text-sm font-semibold">
              {t.additionalPrice}{" "}
              {item.sub_total_formatted || `${item.total} TMT`}
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
              onClick={handleQuantityDecrease}
              disabled={isLoading || isRemoving}
              className="rounded-xl bg-blue-50"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-12 text-center font-semibold">
              {localQuantity}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleQuantityIncrease}
              disabled={isLoading || isRemoving}
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