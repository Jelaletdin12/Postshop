import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyFavoritesProps {
  locale?: string
  message?: string
  actionText?: string
  actionHref?: string
}

export default function EmptyFavorites({
  locale = "ru",
  message = "No favorite items yet",
  actionText = "Browse Products",
  actionHref = "/",
}: EmptyFavoritesProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <Heart className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">{message}</h2>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        {locale === "ru"
          ? "Сохраняйте понравившиеся товары, чтобы найти их позже"
          : "Save items you love to find them later"}
      </p>
      <Link href={actionHref}>
        <Button className="rounded-xl">{actionText}</Button>
      </Link>
    </div>
  )
}
