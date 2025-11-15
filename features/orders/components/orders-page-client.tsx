"use client";

import { useState } from "react";
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
import type { Order } from "../types";

export default function OrdersPageClient() {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { toast } = useToast();

  const { data: orders, isLoading, isError, error } = useOrders();
  const { mutate: cancelOrder, isPending: isCancellingOrder } = useCancelOrder();

  const t = {
    myOrders: "Мои заказы",
    activeOrders: "Активные заказы",
    completedOrders: "Завершенные заказы",
    cancelOrder: "Отменить заказ",
    keepOrder: "Оставить заказ",
    cancelConfirmation: "Вы уверены, что хотите отменить этот заказ?",
    cancelling: "Отмена...",
    orderNumber: "Заказ №",
    ordered: "Заказано",
    completed: "Завершено",
    estimatedDelivery: "Ожид. доставка",
    quantity: "Кол-во",
    total: "Итого",
    noOrders: "У вас пока нет заказов",
    noActiveOrders: "У вас нет активных заказов",
    noCompletedOrders: "У вас нет завершенных заказов",
    loadError: "Не удалось загрузить заказы",
    orderCancelled: "Заказ отменен",
    orderCancelledDescription: "Ваш заказ был успешно отменен",
    error: "Ошибка",
    status: "Статус",
    deliveryTime: "Время доставки",
    deliveryDate: "Дата доставки",
    address: "Адрес",
    paymentMethod: "Способ оплаты",
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelOrder = () => {
    if (!orderToCancel) return;

    cancelOrder(orderToCancel.id, {
      onSuccess: () => {
        toast({
          title: t.orderCancelled,
          description: t.orderCancelledDescription,
        });
        setIsCancelDialogOpen(false);
        setOrderToCancel(null);
      },
      onError: (error: any) => {
        toast({
          title: t.error,
          description: error.message || "Не удалось отменить заказ",
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("ожидается") || lowerStatus.includes("pending")) {
      return <Badge variant="outline">{status}</Badge>;
    }
    if (lowerStatus.includes("обработка") || lowerStatus.includes("processing")) {
      return <Badge variant="secondary">{status}</Badge>;
    }
    if (lowerStatus.includes("отправлен") || lowerStatus.includes("shipped")) {
      return <Badge>{status}</Badge>;
    }
    if (lowerStatus.includes("доставлен") || lowerStatus.includes("delivered")) {
      return <Badge className="bg-green-600">{status}</Badge>;
    }
    if (lowerStatus.includes("отменен") || lowerStatus.includes("cancelled")) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    
    return <Badge>{status}</Badge>;
  };

  const isActiveOrder = (status: string) => {
    const lower = status.toLowerCase();
    return lower.includes("ожидается") || lower.includes("обработка") || lower.includes("отправлен") ||
           lower.includes("pending") || lower.includes("processing") || lower.includes("shipped");
  };

  const activeOrders = orders?.filter((o) => isActiveOrder(o.status)) || [];
  const completedOrders = orders?.filter((o) => !isActiveOrder(o.status)) || [];

  const calculateTotal = (order: Order) => {
    return order.orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price_amount) * item.quantity);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">{t.loadError}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t.noOrders}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            {t.activeOrders} ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t.completedOrders} ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-xl text-gray-400">{t.noActiveOrders}</p>
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
                  translations={t}
                  showCancelButton
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-xl text-gray-400">{t.noCompletedOrders}</p>
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
                  translations={t}
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
              {t.cancelOrder} #{orderToCancel?.id}
            </DialogTitle>
            <DialogDescription>{t.cancelConfirmation}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCancellingOrder}
            >
              {t.keepOrder}
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder} disabled={isCancellingOrder}>
              {isCancellingOrder ? t.cancelling : t.cancelOrder}
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
  translations: any;
  showCancelButton: boolean;
}

function OrderCard({
  order,
  onCancel,
  isCancelling,
  getStatusBadge,
  calculateTotal,
  translations: t,
  showCancelButton,
}: OrderCardProps) {
  const total = calculateTotal(order);

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {t.orderNumber}{order.id}
          </h3>
          {getStatusBadge(order.status)}
        </div>

        <div className="mb-3 space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">{t.deliveryTime}:</span> {order.delivery_time}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t.deliveryDate}:</span>{" "}
            {new Date(order.delivery_at).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t.address}:</span> {order.customer_address}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{t.paymentMethod}:</span> {order.payment_type}
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
                  {t.quantity}: {item.quantity} × {item.unit_price_amount} TMT
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>{t.total}</span>
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
            {t.cancelOrder}
          </Button>
        </div>
      )}
    </Card>
  );
}