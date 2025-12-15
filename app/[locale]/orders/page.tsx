import type { Metadata, ResolvingMetadata } from "next";
import OrdersPageClient from "../../../features/orders/components/OrderPage";

const metadataContent = {
  tm: {
    title: "Meniň Sargytlarym | Post shop",
    description: "Sargytlaryňyzy görüň",
  },
  ru: {
    title: "Мои Заказы | Пост-магазин",
    description: "Просмотр истории заказов",
  },
} as const;

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const localeKey = locale as keyof typeof metadataContent;
  const content = metadataContent[localeKey] || metadataContent.ru;

  return {
    title: content.title,
    description: content.description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;
  return <OrdersPageClient locale={locale} />;
}