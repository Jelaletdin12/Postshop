import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 600; // ISR: Revalidate every 10 minutes

const CATEGORY_META = {
  tm: {
    suffix: " | Post shop",
    description: "Kategoriýa boýunça harytlary gözläň",
    ogLocale: "tk_TM",
  },
  ru: {
    suffix: " | Post shop",
    description: "Просмотр товаров в данной категории",
    ogLocale: "ru_RU",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const meta =
    CATEGORY_META[locale as keyof typeof CATEGORY_META] ?? CATEGORY_META.ru;

  return {
    title: `${slug}${meta.suffix}`,
    description: meta.description,
    openGraph: {
      locale: meta.ogLocale,
      title: `${slug}${meta.suffix}`,
      description: meta.description,
    },
  };
}

export async function generateStaticParams() {
  const categories = ["electronics", "clothing", "home-garden"];
  return categories.map((slug) => ({ slug }));
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  const CategoryPageClient = (
    await import("../../../../features/category/components/CategoryPageClient")
  ).default;
  return <CategoryPageClient params={params} />;
}
