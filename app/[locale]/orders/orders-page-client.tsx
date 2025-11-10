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
import { useOrders, useCancelOrder } from "@/lib/hooks"
import type { Order } from "@/lib/types/api"

interface OrdersPageProps {
  locale?: string
}

export default function OrdersPageClient({ locale }: OrdersPageProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const { data: orders, isLoading, isError } = useOrders()
  const { mutate: cancelOrder, isPending: isCancellingOrder } = useCancelOrder()

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order)
    setIsCancelDialogOpen(true)
  }

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      cancelOrder(orderToCancel.id, {
        onSuccess: () => {
          setIsCancelDialogOpen(false)
          setOrderToCancel(null)
        },
      })
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{status}</Badge>
      case "processing":
        return <Badge variant="secondary">{status}</Badge>
      case "shipped":
        return <Badge variant="default">{status}</Badge>
      case "delivered":
        return <Badge className="bg-green-600">{status}</Badge>
      case "cancelled":
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const activeOrders = orders?.filter((o) => ["pending", "processing", "shipped"].includes(o.status)) || []
  const completedOrders = orders?.filter((o) => ["delivered", "cancelled"].includes(o.status)) || []

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">Failed to load orders. Please try again later.</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed Orders ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <p className="text-gray-500">You have no active orders.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          Ordered: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        {order.estimated_delivery && (
                          <p className="text-sm text-gray-600">Est. Delivery: {order.estimated_delivery}</p>
                        )}
                      </div>
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-start gap-3">
                            {item.product?.image && (
                              <Image
                                src={item.product.image || "/placeholder.svg"}
                                alt={item.product.name}
                                width={50}
                                height={50}
                                className="rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product?.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{order.total_formatted || `$${order.total}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order)}
                        disabled={isCancellingOrder || order.status === "shipped" || order.status === "delivered"}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedOrders.length === 0 ? (
              <p className="text-gray-500">You have no completed orders.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          Ordered: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        {order.updated_at && (
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(order.updated_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-start gap-3">
                            {item.product?.image && (
                              <Image
                                src={item.product.image || "/placeholder.svg"}
                                alt={item.product.name}
                                width={50}
                                height={50}
                                className="rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product?.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{order.total_formatted || `$${order.total}`}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order #{orderToCancel?.id}</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder} disabled={isCancellingOrder}>
              {isCancellingOrder ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
