import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyCartProps {
  locale?: string
  message?: string
  actionText?: string
  actionHref?: string
}

export default function EmptyCart({
  locale = "ru",
  message = "Your cart is empty",
  actionText = "Start Shopping",
  actionHref = "/",
}: EmptyCartProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">{message}</h2>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        {locale === "ru"
          ? "Добавьте товары в корзину, чтобы начать покупки"
          : "Add items to your cart to start shopping"}
      </p>
      <Link href={actionHref}>
        <Button className="rounded-xl">{actionText}</Button>
      </Link>
    </div>
  )
}
