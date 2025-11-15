import type { Metadata } from "next"
import OrdersPageClient from "../../../features/orders/components/orders-page-client"

export const metadata: Metadata = {
  title: "My Orders | E-Commerce",
  description: "View your order history",
  robots: "noindex, nofollow", // Private page
}

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function OrdersPage({ params }: PageProps) {
  const resolvedParams = await params

  return <OrdersPageClient locale={resolvedParams.locale} />
}
