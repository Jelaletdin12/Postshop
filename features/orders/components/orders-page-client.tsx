"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useOrders, useCancelOrder } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import type { Order } from "@/lib/types/api";

interface OrdersPageClientProps {
  locale: string;
}

export default function OrdersPageClient({ locale }: OrdersPageClientProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { toast } = useToast();
  const t = useTranslations();

  const { data: orders, isLoading, isError, error } = useOrders();
  const { mutate: cancelOrder, isPending: isCancellingOrder } = useCancelOrder();

  const handleCancelOrder = useCallback((order: Order) => {
    setOrderToCancel(order);
    setIsCancelDialogOpen(true);
  }, []);

  const confirmCancelOrder = useCallback(() => {
    if (!orderToCancel) return;

    cancelOrder(orderToCancel.id, {
      onSuccess: () => {
        toast({
          title: t("order_cancelled"),
          description: t("order_cancelled_description"),
        });
        setIsCancelDialogOpen(false);
        setOrderToCancel(null);
      },
      onError: (error: any) => {
        toast({
          title: t("error"),
          description: error.message || t("cancel_order_failed"),
          variant: "destructive",
        });
      },
    });
  }, [orderToCancel, cancelOrder, toast, t]);

  const getStatusBadge = useCallback((status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("ожидается") || lowerStatus.includes("pending") || lowerStatus.includes("garaşlama")) {
      return <Badge variant="outline">{status}</Badge>;
    }
    if (lowerStatus.includes("обработка") || lowerStatus.includes("processing") || lowerStatus.includes("işlenýär")) {
      return <Badge variant="secondary">{status}</Badge>;
    }
    if (lowerStatus.includes("отправлен") || lowerStatus.includes("shipped") || lowerStatus.includes("iberildi")) {
      return <Badge>{status}</Badge>;
    }
    if (lowerStatus.includes("доставлен") || lowerStatus.includes("delivered") || lowerStatus.includes("eltildi")) {
      return <Badge className="bg-green-600">{status}</Badge>;
    }
    if (lowerStatus.includes("отменен") || lowerStatus.includes("cancelled") || lowerStatus.includes("ýatyryldy")) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    
    return <Badge>{status}</Badge>;
  }, []);

  const isActiveOrder = useCallback((status: string) => {
    const lower = status.toLowerCase();
    return lower.includes("ожидается") || lower.includes("обработка") || lower.includes("отправлен") ||
           lower.includes("pending") || lower.includes("processing") || lower.includes("shipped") ||
           lower.includes("garaşlama") || lower.includes("işlenýär") || lower.includes("iberildi");
  }, []);

  const activeOrders = useMemo(() => orders?.filter((o) => isActiveOrder(o.status)) || [], [orders, isActiveOrder]);
  const completedOrders = useMemo(() => orders?.filter((o) => !isActiveOrder(o.status)) || [], [orders, isActiveOrder]);

  const calculateTotal = useCallback((order: Order) => {
    return order.orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price_amount) * item.quantity);
    }, 0);
  }, []);

  const loadingSkeleton = useMemo(() => (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t("my_orders")}</h1>
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  ), [t]);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("my_orders")}</h1>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">{t("load_orders_error")}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("my_orders")}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t("no_orders")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t("my_orders")}</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            {t("active_orders")} ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("completed_orders")} ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-xl text-gray-400">{t("no_active_orders")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancelOrder}
                  isCancelling={isCancellingOrder}
                  getStatusBadge={getStatusBadge}
                  calculateTotal={calculateTotal}
                  showCancelButton
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-xl text-gray-400">{t("no_completed_orders")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancelOrder}
                  isCancelling={isCancellingOrder}
                  getStatusBadge={getStatusBadge}
                  calculateTotal={calculateTotal}
                  showCancelButton={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("cancel_order")} #{orderToCancel?.id}
            </DialogTitle>
            <DialogDescription>{t("cancel_confirmation")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCancellingOrder}
            >
              {t("keep_order")}
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder} disabled={isCancellingOrder}>
              {isCancellingOrder ? t("cancelling") : t("cancel_order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onCancel: (order: Order) => void;
  isCancelling: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
  calculateTotal: (order: Order) => number;
  showCancelButton: boolean;
}

function OrderCard({
  order,
  onCancel,
  isCancelling,
  getStatusBadge,
  calculateTotal,
  showCancelButton,
}: OrderCardProps) {
  const t = useTranslations();
  const total = useMemo(() => calculateTotal(order), [calculateTotal, order]);

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {t("order_number")}{order.id}
          </h3>
          {getStatusBadge(order.status)}
        </div>

        <div className="mb-3 space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">{t("delivery_time")}:</span> {order.delivery_time}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t("delivery_date")}:</span>{" "}
            {new Date(order.delivery_at).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t("address")}:</span> {order.customer_address}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t("payment_method")}:</span> {order.payment_type}
          </p>
        </div>

        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {order.orderItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Image
                src={item.product.images_400x400 || item.product.thumbnail}
                alt={item.product.name}
                width={50}
                height={50}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {t("product_quantity")}: {item.quantity} × {item.unit_price_amount} TMT
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>{t("total_price")}</span>
            <span>{total.toFixed(2)} TMT</span>
          </div>
        </div>
      </div>

      {showCancelButton && (
        <div className="mt-4">
          <Button
            variant="destructive"
            onClick={() => onCancel(order)}
            disabled={isCancelling}
            className="w-full"
          >
            {t("cancel_order")}
          </Button>
        </div>
      )}
    </Card>
  );
}