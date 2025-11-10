"use client"
export default function ProductPageContent({ slug }: { slug: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Product: {slug}</h1>
      {/* Product content will go here */}
    </div>
  )
}
