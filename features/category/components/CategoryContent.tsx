"use client"
export default function CategoryPageContent({ slug }: { slug: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Category: {slug}</h1>
      {/* Category content will go here */}
    </div>
  )
}
