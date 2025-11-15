import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductPageContent from "../../../../features/products/components/ProductPageContent"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 3600 // ISR: Revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  return {
    title: `Product ${slug} | E-Commerce`,
    description: `View details for product ${slug}`,
    openGraph: {
      locale,
      type: "website",
      title: `Product ${slug} | E-Commerce`,
      description: `View details for product ${slug}`,
    },
  }
}

export async function generateStaticParams() {
  // Generate static params for popular products
  return [{ slug: "nike-air-max" }, { slug: "adidas-ultraboost" }]
}

export default async function ProductPage(props: Props) {
  const params = await props.params

  if (!params.slug) {
    notFound()
  }

  return <ProductPageContent slug={params.slug} />
}
