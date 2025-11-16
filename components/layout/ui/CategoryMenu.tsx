"use client"

import { useState } from "react"
import Link from "next/link"
import { useCategories } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"



interface CategoryMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoryMenu({ isOpen, onClose }: CategoryMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const { data: categories, isLoading } = useCategories()

  if (!isOpen) return null

  const categoryList = categories || []
  const activeCategory = hoveredCategory !== null ? categoryList[hoveredCategory] : null

  return (
    <div className="fixed left-0 right-0 top-22 z-40 bg-white border-b shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex">
          <CategoryList
            categories={categoryList}
            isLoading={isLoading}
            onCategoryHover={setHoveredCategory}
            onCategoryClick={onClose}
          />

          {activeCategory?.children && <SubcategoryList category={activeCategory} onSubcategoryClick={onClose} />}
        </div>
      </div>
    </div>
  )
}

interface CategoryListProps {
  categories: any[]
  isLoading: boolean
  onCategoryHover: (index: number) => void
  onCategoryClick: () => void
}

function CategoryList({ categories, isLoading, onCategoryHover, onCategoryClick }: CategoryListProps) {
  return (
    <div className="w-[280px] border-r">
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto py-2">
        {isLoading
          ? [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 mx-4 my-2 rounded" />)
          : categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}?category_id=${category.id}`}
                onClick={onCategoryClick}
                onMouseEnter={() => onCategoryHover(index)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 hover:text-primary transition-colors"
              >
                {category.icon_class && <i className={`${category.icon_class} text-xl`}></i>}
                <span>{category.name}</span>
              </Link>
            ))}
      </div>
    </div>
  )
}

interface SubcategoryListProps {
  category: any
  onSubcategoryClick: () => void
}

function SubcategoryList({ category, onSubcategoryClick }: SubcategoryListProps) {
  return (
    <div className="flex-1 p-6">
      <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
      <div className="grid grid-cols-3 gap-4">
        {category.children?.map((subCategory: any) => (
          <Link
            key={subCategory.id}
            href={`/category/${subCategory.slug}?category_id=${subCategory.id}`}
            onClick={onSubcategoryClick}
            className="text-gray-600 hover:text-black text-sm py-1 hover:underline"
          >
            {subCategory.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
