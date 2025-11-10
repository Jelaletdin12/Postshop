/**
 * Mock data for development and testing
 */

export const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 199.99,
    category: "electronics",
    image: "/wireless-headphones.png",
    description: "High-quality sound with noise cancellation",
    stock: 50,
  },
  {
    id: 2,
    name: "Classic Analog Watch",
    price: 89.99,
    category: "accessories",
    image: "/analog-watch.png",
    description: "Timeless design with precision movement",
    stock: 30,
  },
  {
    id: 3,
    name: "Portable Charger 20000mAh",
    price: 49.99,
    category: "electronics",
    image: "/portable-charger-lifestyle.png",
    description: "Fast charging technology with dual ports",
    stock: 100,
  },
  {
    id: 4,
    name: "Leather Messenger Bag",
    price: 129.99,
    category: "accessories",
    image: "/leather-messenger-bag.png",
    description: "Premium leather construction",
    stock: 25,
  },
  {
    id: 5,
    name: "4K Webcam",
    price: 149.99,
    category: "electronics",
    image: "/4k-webcam.jpg",
    description: "Professional quality streaming camera",
    stock: 40,
  },
  {
    id: 6,
    name: "USB-C Hub 7-in-1",
    price: 59.99,
    category: "electronics",
    image: "/usb-c-hub.jpg",
    description: "Multiple ports for connectivity",
    stock: 75,
  },
]

export const mockCategories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "/electronics-category.png",
  },
  {
    id: 2,
    name: "Accessories",
    slug: "accessories",
    image: "/accessories-category.png",
  },
]

export const mockOrders = [
  {
    id: 101,
    status: "delivered" as const,
    total: 299.98,
    createdAt: new Date("2024-11-01").toISOString(),
  },
  {
    id: 102,
    status: "processing" as const,
    total: 199.99,
    createdAt: new Date("2024-11-05").toISOString(),
  },
]

export const mockFavorites = [
  { id: 1, productId: 1, addedAt: new Date().toISOString() },
  { id: 2, productId: 3, addedAt: new Date().toISOString() },
]
