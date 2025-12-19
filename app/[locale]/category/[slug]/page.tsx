import type { Metadata } from "next"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 600 // ISR: Revalidate every 10 minutes

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | E-Commerce`,
    description: `Browse ${slug} products in our store`,
    openGraph: {
      locale,
      type: "website",
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | E-Commerce`,
      description: `Browse ${slug} products in our store`,
    },
  }
}

export async function generateStaticParams() {
  const categories = ["electronics", "clothing", "home-garden"]
  return categories.map((slug) => ({ slug }))
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  const { slug } = params

  const CategoryPageClient = (await import("../../../../features/category/components/CategoryPageClient")).default
  return <CategoryPageClient params={params} />
}
