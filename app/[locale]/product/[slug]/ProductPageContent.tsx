"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Heart, ShoppingCart, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import placeholder from "@/public/jb.webp"
import { useProduct, useCategories } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductDetailProps {
  slug: string
}

const ProductPageContent = ({ slug }: ProductDetailProps) => {
  const [isClient, setIsClient] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { data: product, isLoading: productLoading, error } = useProduct(slug)
  const { data: categoriesData } = useCategories()

  if (!isClient) {
    typeof window !== "undefined" && setIsClient(true)
  }

  const t = {
    addToCart: "Add to Cart",
    goToCart: "Go to Cart",
    price: "Price:",
    aboutProduct: "About Product",
    brand: "Brand",
    model: "Model",
    description: "Product Description",
    recommended: "Recommended Products",
    store: "Store",
    writeToStore: "Write to Store",
    color: "Color:",
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      // TODO: implement cart API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsInCart(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setIsLoading(true)
    try {
      setQuantity(newQuantity)
      // TODO: implement cart quantity update API call
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: implement favorites API call
  }

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 max-w-2xl">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-16 h-16 rounded" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Product not found</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50">
              {product.labels && product.labels.length > 0 && (
                <div className="absolute top-0 right-0 z-10 flex flex-col gap-1">
                  {product.labels.map((label) => (
                    <Badge
                      key={label.text}
                      className="rounded-l-md rounded-r-none text-white text-xs font-bold uppercase"
                      style={{ backgroundColor: label.bg_color }}
                    >
                      {label.text}
                    </Badge>
                  ))}
                </div>
              )}
              <Image
                src={product.images?.[selectedImage] || product.image || placeholder}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 rounded overflow-hidden border ${
                      selectedImage === index ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.category && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Category: {product.category}</span>
              </div>
            )}
          </div>

          {/* Product Info Table */}
          <Card className="p-4 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">{t.aboutProduct}</h3>
            <div className="space-y-3">
              {product.brand && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">{t.brand}</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <Separator />
                </>
              )}
              {product.stock !== undefined && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Stock</span>
                    <span className="font-medium">{product.stock}</span>
                  </div>
                  <Separator />
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-xl font-semibold mb-3">{t.description}</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>

        {/* Price & Actions Sidebar */}
        <div className="lg:w-[420px] space-y-4">
          <Card className="p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-500">{t.price}</span>
              <span className="text-3xl font-bold">${product.price}</span>
            </div>

            <div className="space-y-4">
              {isInCart ? (
                <div className="space-y-3">
                  <Link href="/cart">
                    <Button size="lg" className="w-full rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {t.goToCart}
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity === 1 || isLoading}
                      className="rounded-xl bg-blue-50 flex-shrink-0"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg">{quantity}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={isLoading}
                      className="rounded-xl bg-blue-50 flex-shrink-0"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full rounded-xl text-lg font-bold"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t.addToCart}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                className={`w-full rounded-xl ${
                  isFavorite ? "bg-red-50 border-red-200 hover:bg-red-100" : "bg-blue-50"
                }`}
              >
                <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </Card>

          {/* Seller Card */}
          <Card className="p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback>
                  <Store className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">{t.store}</p>
                <h4 className="text-xl font-bold hover:text-primary cursor-pointer">Official Store</h4>
              </div>
            </div>
            <Button variant="outline" size="lg" disabled className="w-full rounded-xl bg-transparent">
              {t.writeToStore}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductPageContent
