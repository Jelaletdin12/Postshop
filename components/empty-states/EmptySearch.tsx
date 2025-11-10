import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptySearchProps {
  locale?: string
  query?: string
  message?: string
  actionText?: string
  actionHref?: string
}

export default function EmptySearch({
  locale = "ru",
  query = "",
  message = "No results found",
  actionText = "Back to Home",
  actionHref = "/",
}: EmptySearchProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <Search className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">{message}</h2>
      {query && (
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          {locale === "ru" ? `No products found for "${query}"` : `No products found for "${query}"`}
        </p>
      )}
      <Link href={actionHref}>
        <Button className="rounded-xl">{actionText}</Button>
      </Link>
    </div>
  )
}
