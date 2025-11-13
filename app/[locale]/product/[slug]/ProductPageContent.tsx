"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Heart, ShoppingCart, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsBySlug } from "@/lib/hooks/useProducts"
import { useAddToCart, useUpdateCartItemQuantity, useCart } from "@/lib/hooks/useCart"
import { toast } from "sonner"

interface ProductDetailProps {
  slug: string
}

const ProductPageContent = ({ slug }: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  // Get product data
  const { data: product, isLoading: productLoading, error } = useProductsBySlug(slug)
  
  // Get cart data to check if product is already in cart
  const { data: cartData } = useCart()
  
  // Cart mutations
  const addToCartMutation = useAddToCart()
  const updateCartMutation = useUpdateCartItemQuantity()

  const t = {
    addToCart: "Sebede goş",
    goToCart: "Sebede git",
    price: "Bahasy:",
    aboutProduct: "Haryt barada",
    brand: "Marka",
    stock: "Mukdary",
    description: "Düşündiriş",
    store: "Dükan",
    writeToStore: "Dükana ýaz",
    color: "Reňk:",
    category: "Kategoriýa:",
    barcode: "Barkod:",
    addedToCart: "Sebede goşuldy",
    updatedCart: "Sebe täzelendi",
    error: "Ýalňyşlyk ýüze çykdy",
  }

  // Check if product is in cart
  const cartItem = cartData?.data?.find((item: any) => item.product?.id === product?.id)
  const isInCart = !!cartItem

  const handleAddToCart = async () => {
    if (!product?.id) return

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: quantity,
      })
      
      toast.success(t.addedToCart, {
        description: `${product.name} sebede goşuldy`,
      })
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error(t.error, {
        description: "Haryt sebede goşup bolmady",
      })
    }
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || !product?.id) return
    if (newQuantity > product.stock) return

    setQuantity(newQuantity)

    // If product is already in cart, update it
    if (isInCart) {
      try {
        await updateCartMutation.mutateAsync({
          productId: product.id,
          quantity: newQuantity,
        })
        
        toast.success(t.updatedCart, {
          description: `Mukdar: ${newQuantity}`,
        })
      } catch (error) {
        console.error("Update cart error:", error)
        toast.error(t.error, {
          description: "Mukdar täzelenip bolmady",
        })
      }
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorites API
  }

  // Loading state
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

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Haryt tapylmady</h2>
        <p className="text-gray-500 mt-2">Bu haryt ýok ýa-da aýryldy</p>
      </div>
    )
  }

  // Extract image URLs from media array
  const imageUrls = product.media?.map(m => m.images_800x800 || m.images_720x720 || m.thumbnail) || []

  const isLoading = addToCartMutation.isPending || updateCartMutation.isPending

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50">
              {imageUrls.length > 0 ? (
                <Image
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Surat ýok
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {imageUrls.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
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
            {product.categories && product.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {product.categories.map((cat, idx) => (
                  <span 
                    key={idx}
                    className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Table */}
          <Card className="p-4 rounded-xl border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{t.aboutProduct}</h3>
            <div className="space-y-3">
              {product.brand?.name && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">{t.brand}</span>
                    <span className="font-medium">{product.brand.name}</span>
                  </div>
                  <Separator />
                </>
              )}
              
              {product.stock !== undefined && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">{t.stock}</span>
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {product.stock === 0 ? 'Ýok' : product.stock}
                    </span>
                  </div>
                  <Separator />
                </>
              )}
              
              {product.barcode && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">{t.barcode}</span>
                    <span className="font-mono text-sm">{product.barcode}</span>
                  </div>
                  <Separator />
                </>
              )}
              
              {product.colour && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">{t.color}</span>
                    <span className="font-medium">{product.colour}</span>
                  </div>
                  <Separator />
                </>
              )}
              
              {product.properties && product.properties.length > 0 && (
                <>
                  {product.properties.map((prop, idx) => (
                    prop.value && (
                      <div key={idx}>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-500">{prop.name}</span>
                          <span className="font-medium">{prop.value}</span>
                        </div>
                        {idx < product.properties.length - 1 && <Separator />}
                      </div>
                    )
                  ))}
                </>
              )}
            </div>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="p-4 rounded-xl border-gray-200">
              <h3 className="text-xl font-semibold mb-3">{t.description}</h3>
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </Card>
          )}
        </div>

        {/* Price & Actions Sidebar */}
        <div className="lg:w-[380px] space-y-4">
          <Card className="p-6 rounded-xl shadow-lg sticky top-4">
            <div className="flex justify-between items-start mb-6">
              <span className="text-lg text-gray-500">{t.price}</span>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-primary">
                  {product.price_amount} TMT
                </span>
                {product.old_price_amount && parseFloat(product.old_price_amount) > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.old_price_amount} TMT
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {isInCart ? (
                <>
                  <Link href="/cart">
                    <Button 
                      size="lg" 
                      className="w-full rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700"
                    >
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
                      className="rounded-xl h-12 w-12"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-xl border rounded-xl h-12 flex items-center justify-center">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={isLoading || quantity >= product.stock}
                      className="rounded-xl h-12 w-12"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isLoading || product.stock === 0}
                  className="w-full rounded-xl text-lg font-bold"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isLoading ? "Goşulýar..." : product.stock === 0 ? "Haryt ýok" : t.addToCart}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                className={`w-full rounded-xl transition-all ${
                  isFavorite 
                    ? "bg-red-50 border-red-300 hover:bg-red-100" 
                    : "hover:bg-gray-50"
                }`}
              >
                <Heart 
                  className={`h-6 w-6 transition-all ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`} 
                />
              </Button>
            </div>
          </Card>

          {/* Store/Channel Card */}
          {product.channel && product.channel.length > 0 && (
            <Card className="p-6 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-14 h-14 bg-primary/10">
                  <AvatarFallback className="bg-transparent">
                    <Store className="h-6 w-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">{t.store}</p>
                  <h4 className="text-lg font-bold">{product.channel[0].name}</h4>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full rounded-xl"
              >
                {t.writeToStore}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPageContent