import type { Metadata } from "next"
import HomePage from "@/components/home/HomePage"

export const revalidate = 300

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params

  const meta = {
    ru: {
      title: "Интернет магазин - Лучшие товары по низким ценам",
      description: "Качественные товары с быстрой доставкой по всей стране"
    },
    tm: {
      title: "Satym dükanı - Iň gowy harytlar aşak bahada",
      description: "Suw harytly towarnama. Elektrika, eşik, ev we bag"
    }
  }

  const { title, description } = meta[locale as keyof typeof meta] || meta.ru

  return {
    title,
    description,
    openGraph: { type: "website", locale, title, description }
  }
}

export default function Page() {
  return <HomePage />
}