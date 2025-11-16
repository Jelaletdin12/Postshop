import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyOrdersProps {
  locale?: string
  message?: string
  actionText?: string
  actionHref?: string
}

export default function EmptyOrders({
  locale = "ru",
  message = "No orders yet",
  actionText = "Start Shopping",
  actionHref = "/",
}: EmptyOrdersProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <Package className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">{message}</h2>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        {locale === "ru"
          ? "У вас еще нет заказов. Начните покупки прямо сейчас!"
          : "You haven't placed any orders yet. Start shopping now!"}
      </p>
      <Link href={actionHref}>
        <Button className="rounded-xl">{actionText}</Button>
      </Link>
    </div>
  )
}
