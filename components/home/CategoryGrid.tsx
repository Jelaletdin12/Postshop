"use client"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/types/api"

type Props = {
  categories: Category[] | undefined
  isLoading: boolean
  isError: boolean
  locale: string
  title: string
}

export default function CategoryGrid({ categories, isLoading, isError, locale, title }: Props) {
  if (isError) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-red-600">Failed to load categories. Please try again.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full h-36 rounded-lg" />
              <Skeleton className="w-full h-4 rounded" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/${locale}/category/${cat.slug}?category_id=${cat.id}`}>
            <Card className="hover:shadow-md border-none shadow-none p-0 gap-2 transition-all cursor-pointer">
              <div className="relative w-full h-36 overflow-hidden rounded-lg">
               <Image
  src={cat.media?.[0]?.images_400x400 || "/placeholder.svg"}
  alt={cat.name}
  fill
  className="object-contain"
/>

              </div>
              <CardContent className="py-2">
                <p className="text-sm font-medium text-gray-800 truncate text-center">{cat.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
