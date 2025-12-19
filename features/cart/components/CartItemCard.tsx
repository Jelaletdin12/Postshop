"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateCartItemQuantity, useRemoveFromCart } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/lib/types/api";

interface CartItemCardProps {
  item: CartItem;
  onUpdate?: () => void;
}

// Session Storage Key
const PENDING_CART_UPDATES_KEY = "pendingCartUpdates";

interface PendingUpdate {
  quantity: number;
  timestamp: number;
  retryCount: number;
}

export default function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const t = useTranslations();

  // Local UI State (Instant feedback)
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // Stock limit modal
  const [showStockModal, setShowStockModal] = useState(false);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRequestInFlightRef = useRef(false);
  const pendingQuantityRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Function refs to solve circular dependency
  const syncToServerRef = useRef<((quantity: number) => void) | null>(null);
  const retrySyncRef = useRef<((quantity: number) => void) | null>(null);

  const { mutate: updateQuantity } = useUpdateCartItemQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();

  // Get available stock
  const availableStock = item.product.stock || 0;

  // Initialize from server state
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Save to sessionStorage
  const savePendingUpdate = useCallback(
    (quantity: number) => {
      try {
        const stored = sessionStorage.getItem(PENDING_CART_UPDATES_KEY);
        const pending: Record<number, PendingUpdate> = stored
          ? JSON.parse(stored)
          : {};

        pending[item.product_id] = {
          quantity,
          timestamp: Date.now(),
          retryCount: retryCountRef.current,
        };

        sessionStorage.setItem(
          PENDING_CART_UPDATES_KEY,
          JSON.stringify(pending)
        );
      } catch (error) {
        console.error("Failed to save pending update:", error);
      }
    },
    [item.product_id]
  );

  // Remove from sessionStorage
  const clearPendingUpdate = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(PENDING_CART_UPDATES_KEY);
      if (stored) {
        const pending: Record<number, PendingUpdate> = JSON.parse(stored);
        delete pending[item.product_id];

        if (Object.keys(pending).length === 0) {
          sessionStorage.removeItem(PENDING_CART_UPDATES_KEY);
        } else {
          sessionStorage.setItem(
            PENDING_CART_UPDATES_KEY,
            JSON.stringify(pending)
          );
        }
      }
    } catch (error) {
      console.error("Failed to clear pending update:", error);
    }
  }, [item.product_id]);

  // Exponential backoff retry
  const retrySync = useCallback((quantity: number) => {
    const maxRetries = 4;
    const retryCount = retryCountRef.current;

    if (retryCount >= maxRetries) {
      setSyncError(true);
      setIsSyncing(false);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, retryCount), 16000); // Max 16s
    retryCountRef.current++;

    retryTimerRef.current = setTimeout(() => {
      syncToServerRef.current?.(quantity);
    }, delay);
  }, []);

  // Update ref
  retrySyncRef.current = retrySync;

  // Sync to server
  const syncToServer = useCallback(
    (quantity: number) => {
      // If already syncing, queue this update
      if (isRequestInFlightRef.current) {
        pendingQuantityRef.current = quantity;
        return;
      }

      // Mark as syncing
      isRequestInFlightRef.current = true;
      setIsSyncing(true);
      setSyncError(false);

      if (quantity <= 0) {
        removeItem(item.product_id, {
          onSuccess: () => {
            isRequestInFlightRef.current = false;
            setIsSyncing(false);
            retryCountRef.current = 0;
            clearPendingUpdate();
            onUpdate?.();

            // Process queued update if any
            if (pendingQuantityRef.current !== null) {
              const nextQuantity = pendingQuantityRef.current;
              pendingQuantityRef.current = null;
              setTimeout(() => syncToServerRef.current?.(nextQuantity), 100);
            }
          },
          onError: (error) => {
            console.error("Remove failed:", error);
            isRequestInFlightRef.current = false;
            retrySyncRef.current?.(quantity);
          },
        });
      } else {
        updateQuantity(
          { productId: item.product_id, quantity },
          {
            onSuccess: () => {
              isRequestInFlightRef.current = false;
              setIsSyncing(false);
              retryCountRef.current = 0;
              clearPendingUpdate();
              onUpdate?.();

              // Process queued update if any
              if (pendingQuantityRef.current !== null) {
                const nextQuantity = pendingQuantityRef.current;
                pendingQuantityRef.current = null;
                setTimeout(() => syncToServerRef.current?.(nextQuantity), 100);
              }
            },
            onError: (error) => {
              console.error("Update failed:", error);
              isRequestInFlightRef.current = false;

              // Rollback on error after retries exhausted
              if (retryCountRef.current >= 3) {
                setLocalQuantity(item.quantity);
                clearPendingUpdate();
              }

              retrySyncRef.current?.(quantity);
            },
          }
        );
      }
    },
    [
      item.product_id,
      item.quantity,
      updateQuantity,
      removeItem,
      onUpdate,
      clearPendingUpdate,
    ]
  );

  // Update ref
  syncToServerRef.current = syncToServer;

  // Load pending updates from sessionStorage on mount
  useEffect(() => {
    const loadPendingUpdates = () => {
      try {
        const stored = sessionStorage.getItem(PENDING_CART_UPDATES_KEY);
        if (stored) {
          const pending: Record<number, PendingUpdate> = JSON.parse(stored);
          const productPending = pending[item.product_id];

          if (productPending && productPending.quantity !== item.quantity) {
            // Apply pending update
            setLocalQuantity(productPending.quantity);
            pendingQuantityRef.current = productPending.quantity;
            retryCountRef.current = productPending.retryCount;

            // Trigger sync after a short delay
            setTimeout(
              () => syncToServerRef.current?.(productPending.quantity),
              500
            );
          }
        }
      } catch (error) {
        console.error("Failed to load pending updates:", error);
      }
    };

    loadPendingUpdates();
  }, [item.product_id, item.quantity]);

  // Debounced sync
  useEffect(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If local quantity matches server, no sync needed
    if (localQuantity === item.quantity) {
      return;
    }

    // Save to sessionStorage immediately
    savePendingUpdate(localQuantity);

    // Debounce the API call
    debounceTimerRef.current = setTimeout(() => {
      syncToServerRef.current?.(localQuantity);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuantity, item.quantity, savePendingUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const handleQuantityIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check stock limit
    if (localQuantity >= availableStock) {
      setShowStockModal(true);
      return;
    }

    // Optimistic update (instant UI feedback)
    setLocalQuantity((prev) => prev + 1);
  };

  const handleQuantityDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (localQuantity <= 1) {
      handleDelete();
      return;
    }

    // Optimistic update (instant UI feedback)
    setLocalQuantity((prev) => prev - 1);
  };

  const handleDelete = () => {
    setLocalQuantity(0);
    clearPendingUpdate();
  };

  const getImageSrc = () => {
    if (item.product.image) return item.product.image;
    if (item.product.images && item.product.images.length > 0)
      return item.product.images[0];
    return "/placeholder.svg";
  };

  return (
    <>
      <Card className="p-4 shadow-none border">
        <div className="flex flex-col sm:flex-row gap-4">
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
              <p className="text-sm text-gray-600">
                {item.seller?.name || "Store"}
              </p>
              {availableStock <= 5 && (
                <p className="text-xs text-orange-600 font-medium">
                  {t("only_left", { count: availableStock })}
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isRemoving}
                className="w-fit cursor-pointer p-0 h-auto hover:bg-transparent hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {t("unit_price")}{" "}
                <span className="text-primary">{item.price_formatted}</span>
              </p>

              {item.discount_formatted &&
                item.discount_formatted !== "0 TMT" && (
                  <p className="text-sm font-semibold">
                    {t("discount")} {item.discount_formatted}
                  </p>
                )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {t("total_price")}
                </span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold text-base">
                  {(
                    parseFloat(item.product.price_amount || "0") * localQuantity
                  ).toFixed(2)}{" "}
                  TMT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleQuantityDecrease}
                className={` cursor-pointer rounded-xl bg-blue-50 ${
                  isSyncing ? "opacity-70" : ""
                }`}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="w-12 text-center font-semibold relative">
                {localQuantity}
                {isSyncing && (
                  <Loader2 className="h-3 w-3 animate-spin absolute -top-1 -right-3 text-blue-500" />
                )}
                {syncError && (
                  <span
                    className="absolute -top-1 -right-3 h-2 w-2 bg-red-500 rounded-full"
                    title="Sync error"
                  />
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleQuantityIncrease}
                // disabled={localQuantity >= availableStock}
                className={`rounded-xl cursor-pointer bg-blue-50 ${
                  isSyncing ? "opacity-70" : ""
                } ${
                  localQuantity >= availableStock
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Plus className="h-4 w-4 text-[#007AFF]" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stock Limit Modal */}
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
                product: item.product.name,
                stock: availableStock,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setShowStockModal(false)}
              className="w-full rounded-lg cursor-pointer"
            >
              {t("understood")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
