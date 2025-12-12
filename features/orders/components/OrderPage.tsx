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
import {
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
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
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const t = useTranslations();

  const { data: orders, isLoading, isError } = useOrders();
  const { mutate: cancelOrder, isPending: isCancellingOrder } =
    useCancelOrder();

  const toggleOrderExpand = useCallback((orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

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

    if (
      lowerStatus.includes("ожидается") ||
      lowerStatus.includes("pending") ||
      lowerStatus.includes("garaşlama")
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-300"
        >
          {status}
        </Badge>
      );
    }
    if (
      lowerStatus.includes("обработка") ||
      lowerStatus.includes("processing") ||
      lowerStatus.includes("işlenýär")
    ) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {status}
        </Badge>
      );
    }
    if (
      lowerStatus.includes("отправлен") ||
      lowerStatus.includes("shipped") ||
      lowerStatus.includes("iberildi")
    ) {
      return <Badge className="bg-purple-500">{status}</Badge>;
    }
    if (
      lowerStatus.includes("доставлен") ||
      lowerStatus.includes("delivered") ||
      lowerStatus.includes("eltildi")
    ) {
      return <Badge className="bg-green-600">{status}</Badge>;
    }
    if (
      lowerStatus.includes("отменен") ||
      lowerStatus.includes("cancelled") ||
      lowerStatus.includes("ýatyryldy")
    ) {
      return <Badge variant="destructive">{status}</Badge>;
    }

    return <Badge>{status}</Badge>;
  }, []);

  const isActiveOrder = useCallback((status: string) => {
    const lower = status.toLowerCase();
    return (
      lower.includes("ожидается") ||
      lower.includes("обработка") ||
      lower.includes("отправлен") ||
      lower.includes("pending") ||
      lower.includes("processing") ||
      lower.includes("shipped") ||
      lower.includes("garaşylýar") ||
      lower.includes("işlenýär") ||
      lower.includes("iberildi")
    );
  }, []);

  const activeOrders = useMemo(
    () => orders?.filter((o) => isActiveOrder(o.status)) || [],
    [orders, isActiveOrder]
  );
  const completedOrders = useMemo(
    () => orders?.filter((o) => !isActiveOrder(o.status)) || [],
    [orders, isActiveOrder]
  );

  const calculateTotal = useCallback((order: Order) => {
    return order.orderItems.reduce((sum, item) => {
      return sum + parseFloat(item.unit_price_amount) * item.quantity;
    }, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("my_orders")}</h1>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !orders || orders.length === 0) {
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
    <div className="container mx-auto p-2 lg:p-6 md:p-4 mb-16 min-h-screen">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">{t("my_orders")}</h1>

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
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <CompactOrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrders.has(order.id)}
                  onToggle={() => toggleOrderExpand(order.id)}
                  onCancel={handleCancelOrder}
                  isCancelling={isCancellingOrder}
                  getStatusBadge={getStatusBadge}
                  calculateTotal={calculateTotal}
                  showCancelButton
                  t={t}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-xl text-gray-400">
                {t("no_completed_orders")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <CompactOrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrders.has(order.id)}
                  onToggle={() => toggleOrderExpand(order.id)}
                  onCancel={handleCancelOrder}
                  isCancelling={isCancellingOrder}
                  getStatusBadge={getStatusBadge}
                  calculateTotal={calculateTotal}
                  showCancelButton={false}
                  t={t}
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
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={isCancellingOrder}
            >
              {isCancellingOrder ? t("cancelling") : t("cancel_order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CompactOrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onCancel: (order: Order) => void;
  isCancelling: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
  calculateTotal: (order: Order) => number;
  showCancelButton: boolean;
  t: any;
}

function CompactOrderCard({
  order,
  isExpanded,
  onToggle,
  onCancel,
  isCancelling,
  getStatusBadge,
  calculateTotal,
  showCancelButton,
  t,
}: CompactOrderCardProps) {
  const total = useMemo(() => calculateTotal(order), [calculateTotal, order]);
  const itemCount = order.orderItems.length;

  return (
    <Card className="overflow-hidden transition-all py-2 md:py-4 lg:py-6 hover:shadow-md">
      {/* Compact Header - Always Visible */}
      <div
        className="p-2 md:p-4 mx-2 md:mx-4 rounded-lg cursor-pointer bg-linear-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-semibold text-base lg:text-lg">
                  {t("order_number")} {order.id}
                </h3>
                <p className="text-sm text-gray-500">
                  {itemCount} {itemCount === 1 ? t("product") : t("products")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col md:flex-row gap-2 ">
              
            {getStatusBadge(order.status)}
            <div className="text-right">
              <p className="font-bold text-lg text-green-600">
                {total.toFixed(2)} TMT
              </p>
            </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t bg-white">
          {/* Order Info Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("delivery_date")}
                </p>
                <p className="text-sm text-gray-900">
                  {new Date(order.delivery_at).toLocaleDateString()} •{" "}
                  {order.delivery_time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("address")}
                </p>
                <p className="text-sm text-gray-900">
                  {order.customer_address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("payment_method")}
                </p>
                <p className="text-sm text-gray-900">{order.payment_type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("shipping_method")}
                </p>
                <p className="text-sm text-gray-900">{order.shipping_method}</p>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="p-4">
            <h4 className="font-semibold mb-3 text-gray-700">
              {t("products")}:
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white border">
                    <Image
                      src={
                        item.product.images_400x400 || item.product.thumbnail
                      }
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.quantity} × {item.unit_price_amount} TMT
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {(
                        parseFloat(item.unit_price_amount) * item.quantity
                      ).toFixed(2)}{" "}
                      TMT
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with Total and Actions */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">
                {t("total_price")}:
              </span>
              <span className="text-xl font-bold text-green-600">
                {total.toFixed(2)} TMT
              </span>
            </div>

            {showCancelButton && (
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(order);
                }}
                disabled={isCancelling}
                className="w-full"
              >
                {t("cancel_order")}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
