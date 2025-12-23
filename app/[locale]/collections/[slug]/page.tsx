import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 600; // ISR: 10 minutes

const META = {
  tm: {
    titleSuffix: " | Post shop",
    description: (name: string) => `${name} kolleksiýasyndaky harytlary gözläň`,
    ogLocale: "tk_TM",
  },
  ru: {
    titleSuffix: " | Post shop",
    description: (name: string) => `Просмотр товаров из коллекции «${name}»`,
    ogLocale: "ru_RU",
  },
} as const;

function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const meta = META[locale as keyof typeof META] ?? META.ru;
  const collectionName = formatSlug(slug);
  const title = `${collectionName}${meta.titleSuffix}`;
  const description = meta.description(collectionName);

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const collections = ["new-arrivals", "best-sellers", "featured"];
  return collections.map((slug) => ({ slug }));
}

export default async function CollectionPage(props: Props) {
  const params = await props.params;

  const CollectionPageClient = (
    await import(
      "../../../../features/collections/components/CollectionPageClient"
    )
  ).default;

  return <CollectionPageClient params={params} />;
}
