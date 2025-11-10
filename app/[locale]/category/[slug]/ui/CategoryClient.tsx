"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import CategoryPageContent from "./CategoryContent"
import { notFound } from "next/navigation"

interface FilterItem {
  key: string
  value: number
  name: string
  hex?: string
  image?: string
  selected?: boolean
  slug?: string
  children?: FilterItem[]
}

interface Filter {
  uuid: string
  title: string
  type: "TREE" | "SELECTABLE" | "VOLUME" | "TAB" | "COLOR"
  items: FilterItem | FilterItem[]
}

interface CategoryPageClientProps {
  params: { locale: string; slug: string }
}

export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const { slug, locale } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  
  // Price filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  
  // Selected filters state
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<number>>>({
    brand: new Set(),
    color: new Set(),
    tag: new Set(),
  })

  const t = {
    filter: "Filters",
    from: "From",
    to: "To",
    reset: "Reset",
  }

  if (!slug) {
    notFound()
  }

  const filters: Filter[] = [
    {
      uuid: "1",
      title: "Category",
      type: "TREE",
      items: {
        key: "category",
        value: 1,
        name: "All",
        slug: slug,
        selected: true,
        children: [
          { key: "category", value: 2, name: "Electronics", slug: "electronics", selected: false },
          { key: "category", value: 3, name: "Clothing", slug: "clothing", selected: false },
        ],
      },
    },
    {
      uuid: "2",
      title: "Brand",
      type: "SELECTABLE",
      items: [
        { key: "brand", value: 10, name: "Brand A", image: "/brand-a.png", selected: false },
        { key: "brand", value: 11, name: "Brand B", image: "/brand-b.png", selected: false },
      ],
    },
    {
      uuid: "3",
      title: "Price",
      type: "VOLUME",
      items: {} as FilterItem,
    },
    {
      uuid: "4",
      title: "Color",
      type: "COLOR",
      items: [
        { key: "color", value: 100, name: "Red", hex: "#FF0000", selected: false },
        { key: "color", value: 101, name: "Blue", hex: "#0000FF", selected: false },
      ],
    },
    {
      uuid: "5",
      title: "Tags",
      type: "TAB",
      items: [
        { key: "tag", value: 200, name: "New Arrival", selected: false },
        { key: "tag", value: 201, name: "Sale", selected: false },
      ],
    },
  ]

  const handleFilterChange = (key: string, value: number) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev }
      if (!newFilters[key]) {
        newFilters[key] = new Set()
      }
      
      if (newFilters[key].has(value)) {
        newFilters[key].delete(value)
      } else {
        newFilters[key].add(value)
      }
      
      return newFilters
    })
    
    updateURLParams(key, Array.from(selectedFilters[key] || []))
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
    updateURLParams("price_min", values[0])
    updateURLParams("price_max", values[1])
  }

  const handlePriceInputChange = (type: "from" | "to", value: string) => {
    const numValue = parseInt(value) || 0
    if (type === "from") {
      setPriceRange([numValue, priceRange[1]])
      updateURLParams("price_min", numValue)
    } else {
      setPriceRange([priceRange[0], numValue])
      updateURLParams("price_max", numValue)
    }
  }

  const updateURLParams = (key: string, value: number | number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (Array.isArray(value)) {
      params.delete(key)
      value.forEach((v) => params.append(key, v.toString()))
    } else {
      params.set(key, value.toString())
    }
    
    router.push(`/${locale}/category/${slug}?${params.toString()}`, { scroll: false })
  }

  const resetFilters = () => {
    setSelectedFilters({
      brand: new Set(),
      color: new Set(),
      tag: new Set(),
    })
    setPriceRange([0, 10000])
    router.push(`/${locale}/category/${slug}`)
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {filters.map((filter) => {
        switch (filter.type) {
          case "TREE":
            return (
              <CategoryFilter
                key={filter.uuid}
                data={filter.items as FilterItem}
                title={filter.title}
                locale={locale}
              />
            )
          case "SELECTABLE":
            return (
              <BrandFilter
                key={filter.uuid}
                data={filter.items as FilterItem[]}
                title={filter.title}
                selectedValues={selectedFilters.brand}
                onFilterChange={handleFilterChange}
              />
            )
          case "VOLUME":
            return (
              <PriceFilter
                key={filter.uuid}
                title={filter.title}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                onInputChange={handlePriceInputChange}
                translations={{ from: t.from, to: t.to }}
              />
            )
          case "COLOR":
            return (
              <ColorFilter
                key={filter.uuid}
                data={filter.items as FilterItem[]}
                title={filter.title}
                selectedValues={selectedFilters.color}
                onFilterChange={handleFilterChange}
              />
            )
          case "TAB":
            return (
              <TagFilter
                key={filter.uuid}
                data={filter.items as FilterItem[]}
                title={filter.title}
                selectedValues={selectedFilters.tag}
                onFilterChange={handleFilterChange}
              />
            )
          default:
            return null
        }
      })}
      <Button variant="outline" className="w-full rounded-xl bg-transparent" onClick={resetFilters}>
        {t.reset}
      </Button>
    </div>
  )

  return (
    <div className="flex gap-4">
      {/* Desktop Filters - LEFT SIDE */}
      <div className="hidden sm:block w-[280px] flex-shrink-0 border-r pr-4">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <FiltersContent />
        </ScrollArea>
      </div>

      {/* Content - RIGHT SIDE */}
      <div className="flex-1">
        <CategoryPageContent slug={slug} filters={selectedFilters} priceRange={priceRange} />
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="sm:hidden fixed bottom-20 right-4 rounded-xl font-bold gap-2 z-10 shadow-lg" size="lg">
            {t.filter}
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{t.filter}</SheetTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-md ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] p-4">
            <FiltersContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CategoryFilter({ 
  data, 
  title, 
  locale 
}: { 
  data: FilterItem
  title: string
  locale: string 
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-1">
        <Link
          href={`/${locale}/category/${data.slug}?category_id=${data.value}`}
          className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors ${
            data.selected ? "text-primary font-medium" : ""
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          {data.name}
        </Link>
        {data.children && data.children.length > 0 && (
          <div className="ml-6 space-y-1">
            {data.children.map((child) => (
              <Link
                key={child.value}
                href={`/${locale}/category/${child.slug}?category_id=${child.value}`}
                className={`block py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  child.selected ? "text-primary font-medium" : ""
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BrandFilter({
  data,
  title,
  selectedValues,
  onFilterChange,
}: {
  data: FilterItem[]
  title: string
  selectedValues: Set<number>
  onFilterChange: (key: string, value: number) => void
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ScrollArea className="max-h-[410px]">
        <div className="space-y-1">
          {data.map((item) => {
            const isSelected = selectedValues.has(item.value)
            return (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.key, item.value)}
                className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors group ${
                  isSelected ? "text-primary" : ""
                }`}
              >
                {item.image && (
                  <div
                    className={`flex items-center justify-center w-[50px] h-[50px] bg-gray-50 rounded-lg border-2 transition-colors ${
                      isSelected ? "border-primary" : "border-transparent group-hover:border-primary"
                    }`}
                  >
                    <div className="relative w-8 h-8">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                    </div>
                  </div>
                )}
                <span className="text-left">{item.name}</span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

function PriceFilter({
  title,
  priceRange,
  onPriceChange,
  onInputChange,
  translations,
}: {
  title: string
  priceRange: [number, number]
  onPriceChange: (values: number[]) => void
  onInputChange: (type: "from" | "to", value: string) => void
  translations: { from: string; to: string }
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="price-from" className="text-xs mb-1">
              {translations.from}
            </Label>
            <Input
              id="price-from"
              type="number"
              value={priceRange[0]}
              onChange={(e) => onInputChange("from", e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="price-to" className="text-xs mb-1">
              {translations.to}
            </Label>
            <Input
              id="price-to"
              type="number"
              value={priceRange[1]}
              onChange={(e) => onInputChange("to", e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>
        <Slider min={0} max={99999} step={100} value={priceRange} onValueChange={onPriceChange} className="mt-2" />
      </div>
    </div>
  )
}

function TagFilter({
  data,
  title,
  selectedValues,
  onFilterChange,
}: {
  data: FilterItem[]
  title: string
  selectedValues: Set<number>
  onFilterChange: (key: string, value: number) => void
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item) => {
          const isSelected = selectedValues.has(item.value)
          return (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${item.value}`}
                checked={isSelected}
                onCheckedChange={() => onFilterChange(item.key, item.value)}
              />
              <Label htmlFor={`tag-${item.value}`} className="text-sm font-normal cursor-pointer">
                {item.name}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ColorFilter({
  data,
  title,
  selectedValues,
  onFilterChange,
}: {
  data: FilterItem[]
  title: string
  selectedValues: Set<number>
  onFilterChange: (key: string, value: number) => void
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-5 gap-2">
        {data.map((item) => {
          const isSelected = selectedValues.has(item.value)
          return (
            <button
              key={item.value}
              onClick={() => onFilterChange(item.key, item.value)}
              className={`w-[36px] h-[36px] rounded-lg border-2 p-1 transition-all hover:scale-110 ${
                isSelected ? "border-primary shadow-md" : "border-gray-200"
              }`}
              title={item.name}
            >
              <div className="w-full h-full rounded-md border-2 border-gray-200" style={{ backgroundColor: item.hex }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}