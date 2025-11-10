"use client"
import { useFavorites, useAddToCart, useRemoveFromFavorites } from "@/lib/hooks"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/types/api"

export default function FavoritesPage() {
  const [isHovered, setIsHovered] = useState<number | null>(null)

  const { data: favorites, isLoading, isError } = useFavorites()
  const { mutate: removeFromFavorites } = useRemoveFromFavorites()
  const { mutate: addToCart } = useAddToCart()

  const t = {
    favorites: "Избранные",
    addToCart: "В корзину",
    emptyFavorites: "У вас пока нет избранных товаров",
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.favorites}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.favorites}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t.emptyFavorites}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t.favorites}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((favorite) => (
          <ProductCard
            key={favorite.id}
            productId={favorite.product_id}
            product={favorite.product}
            onRemove={() => removeFromFavorites(favorite.product_id)}
            onAddToCart={() => addToCart({ productId: favorite.product_id })}
            onHover={setIsHovered}
            isHovered={isHovered === favorite.product_id}
            translations={t}
          />
        ))}
      </div>
    </div>
  )
}

interface ProductCardProps {
  productId: number
  product?: Product
  onRemove: () => void
  onAddToCart: () => void
  onHover: (id: number | null) => void
  isHovered: boolean
  translations: { addToCart: string }
}

function ProductCard({
  productId,
  product,
  onRemove,
  onAddToCart,
  onHover,
  isHovered,
  translations,
}: ProductCardProps) {
  if (!product) return null

  return (
    <Card
      className="group overflow-hidden rounded-xl transition-shadow hover:shadow-lg relative"
      onMouseEnter={() => onHover(productId)}
      onMouseLeave={() => onHover(null)}
    >
      <Link href={`/product/${product.slug || productId}`} className="block">
        <div className="relative aspect-square bg-gray-50">
          {/* Labels */}
          {product.labels && product.labels.length > 0 && (
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {product.labels.map((label) => (
                <Badge
                  key={label.text}
                  className="text-white text-[10px] font-bold uppercase px-2 py-0.5"
                  style={{ backgroundColor: label.bg_color }}
                >
                  {label.text}
                </Badge>
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          </button>

          <Image
            src={product.image || product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
          <div className="space-y-1">
            <p className="text-lg font-bold">{product.struct_price_text || `$${product.price}`}</p>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white to-transparent">
          <Button
            onClick={(e) => {
              e.preventDefault()
              onAddToCart()
            }}
            className="w-full rounded-xl gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {translations.addToCart}
          </Button>
        </div>
      )}
    </Card>
  )
}
