"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsBySlug, useRelatedProducts, useSubmitReview } from "@/features/products/hooks/useProducts"
import {
  useAddToCart,
  useUpdateCartItemQuantity,
  useRemoveFromCart,
  useCart,
  cartEvents,
} from "@/features/cart/hooks/useCart"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ProductImageGallery } from "./ProductImageGallery"
import { ProductInfoCard } from "./ProductInfoCard"
import { ProductPurchaseCard } from "./ProductPurchaseCard"
import { ProductReviewsSection } from "./ProductReviewsSection"
import { RelatedProductsSection } from "./RelatedProductsSection"
import { ReviewModal } from "./ReviewModal"
import { StockLimitModal } from "./StockLimitModal"

interface ProductDetailProps {
  slug: string
}

const PENDING_PRODUCT_UPDATES_KEY = "pendingProductUpdates"

interface PendingUpdate {
  quantity: number
  timestamp: number
  retryCount: number
}

const DEBUG = true
const log = (...args: any[]) => {
  if (DEBUG) console.log("[ProductPage]", ...args)
}

export default function ProductPageContent({ slug }: ProductDetailProps) {
  const [localQuantity, setLocalQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // 🔥 NEW: Track initialization

  const t = useTranslations()

  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isRequestInFlightRef = useRef(false)
  const pendingQuantityRef = useRef<number | null>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const syncToServerRef = useRef<((quantity: number) => void) | null>(null)
  const retrySyncRef = useRef<((quantity: number) => void) | null>(null)
  const shouldSyncFromCartRef = useRef(true)
  const lastSyncedQuantityRef = useRef<number | null>(null)

  const { data: product, isLoading: productLoading, error, refetch: refetchProduct } = useProductsBySlug(slug)

  // 🔥 FIX: Memoize cart options to prevent infinite re-subscriptions
  const cartOptions = useMemo(
    () => ({
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }),
    [],
  )

  const { data: cartData, refetch: refetchCart, isFetching: isCartFetching } = useCart(cartOptions)

  const { data: relatedProducts } = useRelatedProducts(product?.id || 0, {
    enabled: !!product?.id,
  })

  const addToCartMutation = useAddToCart()
  const updateCartMutation = useUpdateCartItemQuantity()
  const removeFromCartMutation = useRemoveFromCart()
  const submitReviewMutation = useSubmitReview()

  const cartItem = useMemo(() => {
    const item = cartData?.data?.find((item: any) => item.product?.id === product?.id)
    log("🎯 Cart Item Found:", {
      productId: product?.id,
      cartItem: item,
      quantity: item?.product_quantity,
      isInitialized,
    })
    return item
  }, [cartData, product, isInitialized])

  const isInCart = !!cartItem
  const availableStock = product?.stock || 0

  log("📊 State:", {
    isInCart,
    localQuantity,
    cartItemQuantity: cartItem?.product_quantity,
    availableStock,
    isSyncing,
    shouldSyncFromCart: shouldSyncFromCartRef.current,
    isInitialized,
  })

  const imageUrls = useMemo(
    () => product?.media?.map((m) => m.images_800x800 || m.images_720x720 || m.thumbnail) || [],
    [product],
  )

  const reviews = useMemo(() => product?.reviews_resources || [], [product])
  const averageRating = useMemo(
    () => (product?.reviews?.rating ? Number.parseFloat(product.reviews.rating) : 0),
    [product],
  )

  // 🔥 FIX: Subscribe to cart events ONCE with stable dependencies
  useEffect(() => {
    log("🔔 Setting up cart event subscription")
    const unsubscribe = cartEvents.subscribe(() => {
      log("📢 Cart event received! Refetching...")
      refetchCart()
    })

    return () => {
      log("🔕 Cleaning up cart event subscription")
      unsubscribe()
    }
  }, [refetchCart])

  // 🔥 CRITICAL FIX: Initialize localQuantity from cart ONCE on mount
  useEffect(() => {
    if (!product?.id || isInitialized) return

    log("🚀 Initializing component with product:", product.id)

    if (cartItem?.product_quantity) {
      const serverQuantity = cartItem.product_quantity
      log("✅ Initial cart quantity found:", serverQuantity)
      setLocalQuantity(serverQuantity)
      lastSyncedQuantityRef.current = serverQuantity
    }

    setIsInitialized(true)
  }, [product?.id, cartItem, isInitialized])

  useEffect(() => {
    setLocalQuantity(cartItem?.product_quantity || 1)
  }, [cartItem])

  const savePendingUpdate = useCallback(
    (quantity: number) => {
      if (!product?.id) return
      try {
        const stored = sessionStorage.getItem(PENDING_PRODUCT_UPDATES_KEY)
        const pending: Record<number, PendingUpdate> = stored ? JSON.parse(stored) : {}
        pending[product.id] = {
          quantity,
          timestamp: Date.now(),
          retryCount: retryCountRef.current,
        }
        sessionStorage.setItem(PENDING_PRODUCT_UPDATES_KEY, JSON.stringify(pending))
      } catch (error) {
        console.error("Failed to save pending update:", error)
      }
    },
    [product?.id],
  )

  const clearPendingUpdate = useCallback(() => {
    if (!product?.id) return
    try {
      const stored = sessionStorage.getItem(PENDING_PRODUCT_UPDATES_KEY)
      if (stored) {
        const pending: Record<number, PendingUpdate> = JSON.parse(stored)
        delete pending[product.id]
        if (Object.keys(pending).length === 0) {
          sessionStorage.removeItem(PENDING_PRODUCT_UPDATES_KEY)
        } else {
          sessionStorage.setItem(PENDING_PRODUCT_UPDATES_KEY, JSON.stringify(pending))
        }
      }
    } catch (error) {
      console.error("Failed to clear pending update:", error)
    }
  }, [product?.id])

  const retrySync = useCallback(
    (quantity: number) => {
      const maxRetries = 4
      const retryCount = retryCountRef.current

      if (retryCount >= maxRetries) {
        setSyncError(true)
        setIsSyncing(false)
        shouldSyncFromCartRef.current = true
        toast.error(t("error"), {
          description: t("update_quantity_failed"),
        })
        return
      }

      const delay = Math.min(1000 * Math.pow(2, retryCount), 16000)
      retryCountRef.current++

      retryTimerRef.current = setTimeout(() => {
        syncToServerRef.current?.(quantity)
      }, delay)
    },
    [t],
  )

  retrySyncRef.current = retrySync

  const syncToServer = useCallback(
    async (quantity: number) => {
      if (!product?.id) return

      log("🚀 syncToServer called:", {
        productId: product.id,
        quantity,
        isRequestInFlight: isRequestInFlightRef.current,
        isInCart,
      })

      if (isRequestInFlightRef.current) {
        log("⏳ Request in flight, queuing:", quantity)
        pendingQuantityRef.current = quantity
        return
      }

      isRequestInFlightRef.current = true
      setIsSyncing(true)
      setSyncError(false)

      try {
        if (quantity === 0) {
          log("🗑️ Removing from cart")
          await removeFromCartMutation.mutateAsync(product.id)
          toast.success(t("removed_from_cart"))
        } else if (isInCart) {
          log("🔄 Updating cart quantity")
          await updateCartMutation.mutateAsync({
            productId: product.id,
            quantity: quantity,
          })
        } else {
          log("➕ Adding to cart")
          await addToCartMutation.mutateAsync({
            productId: product.id,
            quantity: quantity,
          })
        }

        log("✅ Sync successful")
        await refetchCart()
        retryCountRef.current = 0
        clearPendingUpdate()

        if (pendingQuantityRef.current !== null) {
          const nextQuantity = pendingQuantityRef.current
          pendingQuantityRef.current = null
          log("📤 Processing queued update:", nextQuantity)
          setTimeout(() => syncToServerRef.current?.(nextQuantity), 100)
        }
      } catch (error) {
        log("❌ Sync failed:", error)
        setLocalQuantity(cartItem?.product_quantity || 1)
        toast.error("Failed to update quantity", {
          description: "Please try again",
        })

        retrySyncRef.current?.(quantity)
      } finally {
        isRequestInFlightRef.current = false
        setIsSyncing(false)
      }
    },
    [
      product?.id,
      isInCart,
      updateCartMutation,
      addToCartMutation,
      removeFromCartMutation,
      cartItem,
      refetchCart,
      clearPendingUpdate,
      t,
    ],
  )

  syncToServerRef.current = syncToServer

  useEffect(() => {
    if (!isInCart || !product?.id) return

    // If local matches server, nothing to sync
    if (localQuantity === (cartItem?.product_quantity || 1)) {
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      syncToServerRef.current?.(localQuantity)
    }, 800)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [localQuantity, isInCart, product?.id, cartItem?.product_quantity])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  const handleAddToCart = useCallback(async () => {
    if (!product?.id) return

    if (localQuantity > availableStock) {
      setShowStockModal(true)
      return
    }

    setIsSyncing(true)
    shouldSyncFromCartRef.current = false

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: localQuantity,
      })

      lastSyncedQuantityRef.current = localQuantity

      setTimeout(() => {
        shouldSyncFromCartRef.current = true
        refetchCart()
      }, 150)

      setIsSyncing(false)

      toast.success(t("added_to_cart"), {
        description: `${product.name} ${t("added_to_cart_description")}`,
      })
    } catch (error) {
      console.error("Add to cart error:", error)
      setIsSyncing(false)
      shouldSyncFromCartRef.current = true
      toast.error(t("error"), {
        description: t("add_to_cart_failed"),
      })
    }
  }, [product, localQuantity, availableStock, addToCartMutation, refetchCart, t])

  const handleQuantityIncrease = useCallback(() => {
    log("➕ Quantity increase clicked:", {
      current: localQuantity,
      availableStock,
    })
    if (localQuantity >= availableStock) {
      log("⚠️ Stock limit reached")
      setShowStockModal(true)
      return
    }
    setLocalQuantity((prev) => {
      const newVal = prev + 1
      log("📈 New local quantity:", newVal)
      return newVal
    })
  }, [localQuantity, availableStock])

  const handleQuantityDecrease = useCallback(() => {
    log("➖ Quantity decrease clicked:", { current: localQuantity })
    if (localQuantity <= 0) return
    setLocalQuantity((prev) => {
      const newVal = prev - 1
      log("📉 New local quantity:", newVal)
      return newVal
    })
  }, [localQuantity])

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite)
  }, [isFavorite])

  const handleSubmitReview = useCallback(
    async (rating: number, text: string) => {
      if (!product?.id || rating === 0 || !text.trim()) {
        toast.error(t("error"), {
          description: "Please provide rating and review text",
        })
        return
      }

      try {
        await submitReviewMutation.mutateAsync({
          productId: product.id,
          rating: rating,
          title: text,
          source: "site",
        })

        await refetchProduct()

        toast.success("Review submitted successfully!")
        setShowReviewModal(false)
      } catch (error) {
        toast.error(t("error"), {
          description: "Failed to submit review",
        })
      }
    },
    [product?.id, submitReviewMutation, refetchProduct, t],
  )

  const loadingSkeleton = useMemo(
    () => (
      <div className=" mx-auto px-4 py-8">
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
    ),
    [],
  )

  if (productLoading) return loadingSkeleton

  if (error || !product) {
    return (
      <div className=" mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">{t("product_not_found")}</h2>
        <p className="text-gray-500 mt-2">{t("product_not_found_description")}</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-2 md:px-4 lg:px-6 rounded-lg mb-18 space-y-8 max-w-[1504px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 rounded-b-lg bg-white p-4">
          <ProductImageGallery images={imageUrls} productName={product.name} noImageText={t("no_image")} />

          <ProductInfoCard
            brandName={product.brand?.name}
            stock={product.stock}
            barcode={product.barcode}
            colour={product.colour}
            properties={product.properties}
            description={product.description}
            averageRating={averageRating}
            reviewsCount={product.reviews?.count || 0}
            t={t}
          />

          <ProductPurchaseCard
            price={product.price_amount}
            oldPrice={product.old_price_amount}
            isInCart={isInCart}
            localQuantity={localQuantity}
            availableStock={availableStock}
            isSyncing={isSyncing}
            syncError={syncError}
            isFavorite={isFavorite}
            productStock={product.stock}
            channelName={product.channel?.[0]?.name}
            onAddToCart={handleAddToCart}
            onQuantityIncrease={handleQuantityIncrease}
            onQuantityDecrease={handleQuantityDecrease}
            onToggleFavorite={handleToggleFavorite}
            t={t}
          />
        </div>

        <ProductReviewsSection
          reviews={reviews}
          averageRating={averageRating}
          isLoading={false}
          onWriteReview={() => setShowReviewModal(true)}
        />

        <RelatedProductsSection products={relatedProducts || []} />
      </div>

      <StockLimitModal
        open={showStockModal}
        onOpenChange={setShowStockModal}
        productName={product.name}
        availableStock={availableStock}
        t={t}
      />

      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        onSubmit={handleSubmitReview}
        isSubmitting={submitReviewMutation.isPending}
      />
    </>
  )
}
