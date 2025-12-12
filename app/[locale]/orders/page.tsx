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
  params: {
    locale: string;
  };
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const locale = params.locale as keyof typeof metadataContent;

  const content = metadataContent[locale] || metadataContent.ru;

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
  return <OrdersPageClient locale={params.locale} />;
}
