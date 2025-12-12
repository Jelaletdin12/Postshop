import type { Metadata } from "next";
import HomePage from "@/features/home/components/HomePage";

const META = {
  ru: {
    title: "Интернет магазин - Лучшие товары по низким ценам",
    description: "Качественные товары с быстрой доставкой по всей стране",
  },
  tm: {
    title: "Post shop - Iň gowy harytlar, amatly bahada",
    description:
      "Ýokary hilli harytlar. Elektronika, eşik, arassaçylyk, sport, kosmetika",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = META[locale as keyof typeof META] || META.ru;

  return {
    title,
    description,
    openGraph: { type: "website", locale, title, description },
  };
}

export default function Page() {
  return <HomePage />;
}
