"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Heart, ShoppingCart, Store, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductsBySlug } from "@/features/products/hooks/useProducts";
import { useAddToCart, useUpdateCartItemQuantity, useRemoveFromCart, useCart } from "@/features/cart/hooks/useCart";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ProductDetailProps {
  slug: string;
}

const PENDING_PRODUCT_UPDATES_KEY = 'pendingProductUpdates';

interface PendingUpdate {
  quantity: number;
  timestamp: number;
  retryCount: number;
}

export default function ProductPageContent({ slug }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  
  const t = useTranslations();

  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRequestInFlightRef = useRef(false);
  const pendingQuantityRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const syncToServerRef = useRef<((quantity: number) => void) | null>(null);
  const retrySyncRef = useRef<((quantity: number) => void) | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { data: product, isLoading: productLoading, error } = useProductsBySlug(slug);
  const { data: cartData, refetch: refetchCart } = useCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItemQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  const cartItem = useMemo(() => 
    cartData?.data?.find((item: any) => item.product?.id === product?.id),
    [cartData, product]
  );
  const isInCart = !!cartItem;

  const availableStock = product?.stock || 0;

  const imageUrls = useMemo(() => 
    product?.media?.map(m => m.images_800x800 || m.images_720x720 || m.thumbnail) || [],
    [product]
  );

  // Auto-play carousel every 3 seconds
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const startAutoplay = () => {
      autoplayTimerRef.current = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % imageUrls.length);
      }, 3000);
    };

    startAutoplay();

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [imageUrls.length]);

  // Reset autoplay timer when user manually selects image
  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index);
    
    // Reset autoplay timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
    
    if (imageUrls.length > 1) {
      autoplayTimerRef.current = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % imageUrls.length);
      }, 3000);
    }
  }, [imageUrls.length]);

  useEffect(() => {
    if (cartItem?.product_quantity) {
      setLocalQuantity(cartItem.product_quantity);
    }
  }, [cartItem]);

  const savePendingUpdate = useCallback((quantity: number) => {
    if (!product?.id) return;
    
    try {
      const stored = sessionStorage.getItem(PENDING_PRODUCT_UPDATES_KEY);
      const pending: Record<number, PendingUpdate> = stored ? JSON.parse(stored) : {};
      
      pending[product.id] = {
        quantity,
        timestamp: Date.now(),
        retryCount: retryCountRef.current
      };
      
      sessionStorage.setItem(PENDING_PRODUCT_UPDATES_KEY, JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to save pending update:', error);
    }
  }, [product?.id]);

  const clearPendingUpdate = useCallback(() => {
    if (!product?.id) return;
    
    try {
      const stored = sessionStorage.getItem(PENDING_PRODUCT_UPDATES_KEY);
      if (stored) {
        const pending: Record<number, PendingUpdate> = JSON.parse(stored);
        delete pending[product.id];
        
        if (Object.keys(pending).length === 0) {
          sessionStorage.removeItem(PENDING_PRODUCT_UPDATES_KEY);
        } else {
          sessionStorage.setItem(PENDING_PRODUCT_UPDATES_KEY, JSON.stringify(pending));
        }
      }
    } catch (error) {
      console.error('Failed to clear pending update:', error);
    }
  }, [product?.id]);

  const retrySync = useCallback((quantity: number) => {
    const maxRetries = 4;
    const retryCount = retryCountRef.current;

    if (retryCount >= maxRetries) {
      setSyncError(true);
      setIsSyncing(false);
      toast.error(t("error"), {
        description: t("update_quantity_failed"),
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
    retryCountRef.current++;
    
    retryTimerRef.current = setTimeout(() => {
      syncToServerRef.current?.(quantity);
    }, delay);
  }, [t]);

  retrySyncRef.current = retrySync;

  const syncToServer = useCallback(async (quantity: number) => {
    if (!product?.id) return;

    if (isRequestInFlightRef.current) {
      pendingQuantityRef.current = quantity;
      return;
    }

    isRequestInFlightRef.current = true;
    setIsSyncing(true);
    setSyncError(false);

    try {
      // If quantity is 0, remove from cart
      if (quantity === 0) {
        await removeFromCartMutation.mutateAsync(product.id);
        toast.success(t("removed_from_cart"));
      } else if (isInCart) {
        await updateCartMutation.mutateAsync({
          productId: product.id,
          quantity: quantity,
        });
      } else {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          quantity: quantity,
        });
      }

      isRequestInFlightRef.current = false;
      setIsSyncing(false);
      retryCountRef.current = 0;
      clearPendingUpdate();

      await refetchCart();

      if (pendingQuantityRef.current !== null) {
        const nextQuantity = pendingQuantityRef.current;
        pendingQuantityRef.current = null;
        setTimeout(() => syncToServerRef.current?.(nextQuantity), 100);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      isRequestInFlightRef.current = false;
      
      if (retryCountRef.current >= 3) {
        setLocalQuantity(cartItem?.product_quantity || 1);
        clearPendingUpdate();
      }
      
      retrySyncRef.current?.(quantity);
    }
  }, [product?.id, isInCart, updateCartMutation, addToCartMutation, removeFromCartMutation, cartItem, clearPendingUpdate, refetchCart, t]);

  syncToServerRef.current = syncToServer;

  useEffect(() => {
    if (!product?.id) return;

    const loadPendingUpdates = () => {
      try {
        const stored = sessionStorage.getItem(PENDING_PRODUCT_UPDATES_KEY);
        if (stored) {
          const pending: Record<number, PendingUpdate> = JSON.parse(stored);
          const productPending = pending[product.id];
          
          if (productPending && productPending.quantity !== (cartItem?.product_quantity || 1)) {
            setLocalQuantity(productPending.quantity);
            pendingQuantityRef.current = productPending.quantity;
            retryCountRef.current = productPending.retryCount;
            
            setTimeout(() => syncToServerRef.current?.(productPending.quantity), 500);
          }
        }
      } catch (error) {
        console.error('Failed to load pending updates:', error);
      }
    };

    loadPendingUpdates();
  }, [product?.id, cartItem]);

  useEffect(() => {
    if (!isInCart || !product?.id) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (localQuantity === (cartItem?.product_quantity || 1)) {
      return;
    }

    savePendingUpdate(localQuantity);

    debounceTimerRef.current = setTimeout(() => {
      syncToServerRef.current?.(localQuantity);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuantity, isInCart, product?.id, cartItem, savePendingUpdate]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product?.id) return;

    setIsSyncing(true);

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: localQuantity,
      });
      
      await refetchCart();
      
      setIsSyncing(false);
      
      toast.success(t("added_to_cart"), {
        description: `${product.name} ${t("added_to_cart_description")}`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      setIsSyncing(false);
      toast.error(t("error"), {
        description: t("add_to_cart_failed"),
      });
    }
  }, [product, localQuantity, addToCartMutation, refetchCart, t]);

  const handleQuantityIncrease = useCallback(() => {
    if (localQuantity >= availableStock) {
      setShowStockModal(true);
      return;
    }
    
    setLocalQuantity(prev => prev + 1);
  }, [localQuantity, availableStock]);

  const handleQuantityDecrease = useCallback(() => {
    // Allow decreasing to 0 to remove from cart
    if (localQuantity <= 0) return;
    
    setLocalQuantity(prev => prev - 1);
  }, [localQuantity]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const loadingSkeleton = useMemo(() => (
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
  ), []);

  if (productLoading) {
    return loadingSkeleton;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">{t("product_not_found")}</h2>
        <p className="text-gray-500 mt-2">{t("product_not_found_description")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
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
                    {t("no_image")}
                  </div>
                )}
              </div>

              {imageUrls.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {imageUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
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

            <Card className="p-4 rounded-xl border-gray-200">
              <h3 className="text-xl font-semibold mb-4">{t("about_product")}</h3>
              <div className="space-y-3">
                {product.brand?.name && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">{t("brand")}</span>
                      <span className="font-medium">{product.brand.name}</span>
                    </div>
                    <Separator />
                  </>
                )}
                
                {product.stock !== undefined && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">{t("stock")}</span>
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                        {product.stock === 0 ? t("out_of_stock") : product.stock <= 5 ? `${t("only_left", { count: product.stock })}` : product.stock}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                
                {product.barcode && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">{t("barcode")}</span>
                      <span className="font-mono text-sm">{product.barcode}</span>
                    </div>
                    <Separator />
                  </>
                )}
                
                {product.colour && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">{t("color")}</span>
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

            {product.description && (
              <Card className="p-4 rounded-xl border-gray-200">
                <h3 className="text-xl font-semibold mb-3">{t("product_description")}</h3>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </Card>
            )}
          </div>

          <div className="lg:w-[380px] space-y-4">
            <Card className="p-6 rounded-xl ">
              <div className="flex justify-between items-start mb-6">
                <span className="text-lg text-gray-500">{t("price")}:</span>
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
                        {t("go_to_cart")}
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityDecrease}
                        disabled={isSyncing}
                        className={`rounded-xl h-12 w-12 ${isSyncing ? 'opacity-70' : ''}`}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 text-center font-semibold text-xl border rounded-xl h-12 flex items-center justify-center relative">
                        {localQuantity}
                        {isSyncing && (
                          <Loader2 className="h-4 w-4 animate-spin absolute -top-1 -right-1 text-blue-500" />
                        )}
                        {syncError && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" title="Sync error" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityIncrease}
                        disabled={localQuantity >= availableStock || isSyncing}
                        className={`rounded-xl h-12 w-12 ${isSyncing ? 'opacity-70' : ''} ${
                          localQuantity >= availableStock ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isSyncing || product.stock === 0}
                    className="w-full rounded-xl text-lg font-bold"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("adding")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {product.stock === 0 ? t("out_of_stock") : t("add_to_cart")}
                      </>
                    )}
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

            {product.channel && product.channel.length > 0 && (
              <Card className="p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-14 h-14 bg-primary/10">
                    <AvatarFallback className="bg-transparent">
                      <Store className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-500">{t("store")}</p>
                    <h4 className="text-lg font-bold">{product.channel[0].name}</h4>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full rounded-xl"
                >
                  {t("write_to_store")}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              {t("stock_limit_title")}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {t("stock_limit_message", { 
                product: product.name,
                stock: availableStock 
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setShowStockModal(false)}
              className="w-full rounded-xl"
            >
              {t("understood")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}