import type { Metadata } from "next"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 600 // ISR: Revalidate every 10 minutes

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | E-Commerce`,
    description: `Browse ${slug} collection products in our store`,
    openGraph: {
      locale,
      type: "website",
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | E-Commerce`,
      description: `Browse ${slug} collection products in our store`,
    },
  }
}

export async function generateStaticParams() {
  // Generate static params for popular collections
  const collections = ["new-arrivals", "best-sellers", "featured"]
  return collections.map((slug) => ({ slug }))
}

export default async function CollectionPage(props: Props) {
  const params = await props.params

  const CollectionPageClient = (
    await import("../../../../features/collections/components/CollectionPageClient")
  ).default
  
  return <CollectionPageClient params={params} />
}