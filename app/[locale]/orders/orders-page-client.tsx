"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useOrders, useCancelOrder } from "@/lib/hooks"
import type { Order } from "@/lib/types/api"

interface OrdersPageProps {
  locale?: string
}

export default function OrdersPageClient({ locale }: OrdersPageProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const { toast } = useToast()

  const { data: orders, isLoading, isError, error } = useOrders()
  const { mutate: cancelOrder, isPending: isCancellingOrder } = useCancelOrder()

  const t = {
    orders: "Заказы",
    myOrders: "Мои заказы",
    active: "Активные",
    completed: "Завершенные",
    activeOrders: "Активные заказы",
    completedOrders: "Завершенные заказы",
    cancelOrder: "Отменить заказ",
    keepOrder: "Оставить заказ",
    areYouSure: "Вы уверены?",
    cancelConfirmation: "Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.",
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
    loadError: "Не удалось загрузить заказы. Пожалуйста, попробуйте позже.",
    orderCancelled: "Заказ отменен",
    orderCancelledDescription: "Ваш заказ был успешно отменен",
    error: "Ошибка",
    cannotCancelShipped: "Нельзя отменить заказ, который уже отправлен или доставлен",
  }

  const handleCancelOrder = (order: Order) => {
    // Check if order can be cancelled
    if (order.status === "shipped" || order.status === "delivered") {
      toast({
        title: t.error,
        description: t.cannotCancelShipped,
        variant: "destructive",
      })
      return
    }

    setOrderToCancel(order)
    setIsCancelDialogOpen(true)
  }

  const confirmCancelOrder = () => {
    if (!orderToCancel) return

    cancelOrder(orderToCancel.id, {
      onSuccess: () => {
        toast({
          title: t.orderCancelled,
          description: t.orderCancelledDescription,
        })
        setIsCancelDialogOpen(false)
        setOrderToCancel(null)
      },
      onError: (error: any) => {
        toast({
          title: t.error,
          description: error.message || "Не удалось отменить заказ",
          variant: "destructive",
        })
      },
    })
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusMap: Record<string, { label: string; variant: string; className?: string }> = {
      pending: { label: "Ожидание", variant: "outline" },
      processing: { label: "Обработка", variant: "secondary" },
      shipped: { label: "Отправлен", variant: "default" },
      delivered: { label: "Доставлен", variant: "default", className: "bg-green-600" },
      cancelled: { label: "Отменен", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return (
      <Badge variant={statusInfo.variant as any} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const activeOrders = orders?.filter((o) => ["pending", "processing", "shipped"].includes(o.status)) || []
  const completedOrders = orders?.filter((o) => ["delivered", "cancelled"].includes(o.status)) || []

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
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">{t.loadError}</p>
          {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
        </div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-gray-400">{t.noOrders}</p>
        </div>
      </div>
    )
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
  )
}

interface OrderCardProps {
  order: Order
  onCancel: (order: Order) => void
  isCancelling: boolean
  getStatusBadge: (status: Order["status"]) => React.ReactNode
  translations: any
  showCancelButton: boolean
}

function OrderCard({
  order,
  onCancel,
  isCancelling,
  getStatusBadge,
  translations: t,
  showCancelButton,
}: OrderCardProps) {
  const canCancel =
    showCancelButton && order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled"

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {t.orderNumber}{order.id}
          </h3>
          {getStatusBadge(order.status)}
        </div>

        <div className="mb-3 space-y-1">
          <p className="text-sm text-gray-600">
            {t.ordered}: {new Date(order.created_at).toLocaleDateString()}
          </p>
          {order.estimated_delivery && (
            <p className="text-sm text-gray-600">
              {t.estimatedDelivery}: {order.estimated_delivery}
            </p>
          )}
          {!showCancelButton && order.updated_at && (
            <p className="text-sm text-gray-600">
              {t.completed}: {new Date(order.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              {item.product?.image && (
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  width={50}
                  height={50}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                <p className="text-xs text-gray-500">
                  {t.quantity}: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>{t.total}</span>
            <span>{order.total_formatted || `$${order.total}`}</span>
          </div>
        </div>
      </div>

      {canCancel && (
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
  )
}