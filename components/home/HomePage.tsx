"use client"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState, useCallback } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import HeroCarousel from "./Carousel"
import CategoryGrid from "./CategoryGrid"
import CollectionSection from "./ProductGrid"
import { useCategories, useCarousels, useCollections } from "@/lib/hooks"
import type { Collection } from "@/lib/types/api"

export default function HomePage() {
  const locale = useLocale()
  const t = useTranslations("common")
  const [mounted, setMounted] = useState(false)
  const [visibleCollections, setVisibleCollections] = useState<Collection[]>([])
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 10

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const { data: carousels, isLoading: carouselsLoading } = useCarousels()
  const { data: collections, isLoading: collectionsLoading, isError: collectionsError } = useCollections()

  useEffect(() => setMounted(true), [])

  // Initialize visible collections when data first loads
  useEffect(() => {
    console.log("=== Collections Data Change ===")
    console.log("Collections:", collections)
    console.log("Collections length:", collections?.length)
    console.log("Visible collections length:", visibleCollections.length)
    
    if (collections && collections.length > 0 && visibleCollections.length === 0) {
      console.log("🟢 Initializing first batch of collections")
      const initial = collections.slice(0, itemsPerPage)
      console.log("Initial collections to show:", initial.length)
      setVisibleCollections(initial)
      setHasMore(collections.length > itemsPerPage)
      console.log("Has more after init:", collections.length > itemsPerPage)
    }
  }, [collections, visibleCollections.length])

  const loadMoreCollections = useCallback(() => {
    console.log("=== loadMoreCollections Called ===")
    console.log("Collections available:", collections?.length)
    console.log("Visible collections:", visibleCollections.length)
    console.log("Has more:", hasMore)

    if (!collections) {
      console.log("❌ No collections data")
      return
    }

    const currentLength = visibleCollections.length
    const nextCollections = collections.slice(
      currentLength,
      currentLength + itemsPerPage
    )

    console.log("Current length:", currentLength)
    console.log("Next batch size:", nextCollections.length)
    console.log("Next batch:", nextCollections.map(c => c.id))

    if (nextCollections.length > 0) {
      console.log("🟢 Adding", nextCollections.length, "more collections")
      setVisibleCollections((prev) => {
        const updated = [...prev, ...nextCollections]
        console.log("Updated visible collections count:", updated.length)
        return updated
      })
    } else {
      console.log("⚠️ No more collections to load")
    }

    // Check if we've loaded all collections
    const newTotal = currentLength + nextCollections.length
    const shouldHaveMore = newTotal < collections.length
    console.log("New total:", newTotal, "/ Total available:", collections.length)
    console.log("Should have more:", shouldHaveMore)
    
    if (!shouldHaveMore) {
      console.log("🔴 Setting hasMore to false")
      setHasMore(false)
    }
  }, [collections, visibleCollections.length, itemsPerPage, hasMore])

  useEffect(() => {
    console.log("=== State Update ===")
    console.log("Visible collections count:", visibleCollections.length)
    console.log("Has more:", hasMore)
  }, [visibleCollections.length, hasMore])

  if (!mounted) return <div className="p-8">Loading...</div>

  // Transform carousel data to match component props
  const carouselItems = carousels?.map(carousel => ({
    title: carousel.title || "",
    image: carousel.image || carousel.thumbnail,
    url: carousel.link || null
  })) || []

  console.log("=== Render ===")
  console.log("Collections loading:", collectionsLoading)
  console.log("Visible collections for render:", visibleCollections.length)
  console.log("Has more for InfiniteScroll:", hasMore)

  return (
    <div className="px-4 md:px-8 lg:px-12 pt-8 pb-12 space-y-8">
      {/* Hero Carousel with API data */}
      {!carouselsLoading && carouselItems.length > 0 && (
        <HeroCarousel items={carouselItems} />
      )}

      {/* Categories Grid */}
      <CategoryGrid
        categories={categories}
        isLoading={categoriesLoading}
        isError={categoriesError}
        locale={locale}
        title={t("categories")}
      />

      {/* Collections Sections with Infinite Scroll */}
      {collectionsError ? (
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-red-600">Failed to load collections. Please try again.</p>
        </section>
      ) : collectionsLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-yellow-100 border border-yellow-400 rounded p-4 text-sm">
            <strong>Debug Info:</strong><br/>
            Total Collections: {collections?.length || 0}<br/>
            Visible: {visibleCollections.length}<br/>
            Has More: {hasMore ? "Yes" : "No"}
          </div>
          
          <InfiniteScroll
            dataLength={visibleCollections.length}
            next={loadMoreCollections}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8 bg-blue-50 border-2 border-blue-200 rounded">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="text-gray-500 mt-2 font-bold">Loading more collections...</p>
              </div>
            }
            endMessage={
              <div className="text-center py-8 bg-green-50 border-2 border-green-200 rounded">
                <p className="text-gray-600 font-bold">✓ You've reached the end</p>
              </div>
            }
            scrollThreshold={0.8}
          >
            <div className="space-y-8">
              {visibleCollections.map((collection, index) => (
                <div key={collection.id}>
                  <div className="text-xs text-gray-400 mb-2">Collection #{index + 1}</div>
                  <CollectionSection
                    collection={collection}
                    locale={locale}
                  />
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </>
      )}
    </div>
  )
}