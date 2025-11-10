/**
 * Mock HTTP handlers for development
 * Simulates API responses for TanStack Query testing
 */

import { mockProducts, mockCategories, mockOrders, mockFavorites } from "./data"

interface MockCart {
  id: string
  items: Array<{ id: number; productId: number; quantity: number; price: number }>
  total: number
}

// In-memory storage for development
const mockCart: MockCart = {
  id: "cart-1",
  items: [],
  total: 0,
}

let mockUserFavorites = [...mockFavorites]

/**
 * Simulate network delay for realistic testing
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock API handlers
 */
export const mockHandlers = {
  // Products
  async getProducts() {
    await delay(300)
    return { data: mockProducts }
  },

  async getProduct(id: number) {
    await delay(300)
    const product = mockProducts.find((p) => p.id === id)
    if (!product) throw new Error("Product not found")
    return { data: product }
  },

  // Categories
  async getCategories() {
    await delay(300)
    return { data: mockCategories }
  },

  async getCategory(slug: string) {
    await delay(300)
    const category = mockCategories.find((c) => c.slug === slug)
    if (!category) throw new Error("Category not found")
    const products = mockProducts.filter((p) => p.category === slug)
    return { data: { ...category, products } }
  },

  // Cart operations
  async getCart() {
    await delay(200)
    return { data: mockCart }
  },

  async addToCart(productId: number, quantity = 1) {
    await delay(300)
    const product = mockProducts.find((p) => p.id === productId)
    if (!product) throw new Error("Product not found")

    const existingItem = mockCart.items.find((item) => item.productId === productId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      mockCart.items.push({
        id: Date.now(),
        productId,
        quantity,
        price: product.price,
      })
    }

    mockCart.total = mockCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { data: mockCart }
  },

  async removeFromCart(itemId: number) {
    await delay(300)
    mockCart.items = mockCart.items.filter((item) => item.id !== itemId)
    mockCart.total = mockCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { data: mockCart }
  },

  async updateCartItemQuantity(itemId: number, quantity: number) {
    await delay(300)
    const item = mockCart.items.find((i) => i.id === itemId)
    if (!item) throw new Error("Item not found")
    item.quantity = Math.max(1, quantity)
    mockCart.total = mockCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { data: mockCart }
  },

  // Favorites
  async getFavorites() {
    await delay(200)
    return { data: mockUserFavorites }
  },

  async addToFavorites(productId: number) {
    await delay(300)
    const product = mockProducts.find((p) => p.id === productId)
    if (!product) throw new Error("Product not found")

    const exists = mockUserFavorites.find((f) => f.productId === productId)
    if (!exists) {
      mockUserFavorites.push({
        id: Date.now(),
        productId,
        addedAt: new Date().toISOString(),
      })
    }
    return { data: mockUserFavorites }
  },

  async removeFromFavorites(productId: number) {
    await delay(300)
    mockUserFavorites = mockUserFavorites.filter((f) => f.productId !== productId)
    return { data: mockUserFavorites }
  },

  // Orders
  async getOrders() {
    await delay(300)
    return { data: mockOrders }
  },

  async getOrder(id: number) {
    await delay(300)
    const order = mockOrders.find((o) => o.id === id)
    if (!order) throw new Error("Order not found")
    return { data: order }
  },

  async cancelOrder(orderId: number) {
    await delay(300)
    const order = mockOrders.find((o) => o.id === orderId)
    if (!order) throw new Error("Order not found")
    if (order.status !== "processing" && order.status !== "pending") {
      throw new Error("Cannot cancel shipped or delivered orders")
    }
    order.status = "cancelled"
    return { data: order }
  },

  // Search
  async search(query: string, filters?: { category?: string; priceFrom?: number; priceTo?: number }) {
    await delay(400)
    let results = mockProducts

    if (query) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (filters?.category) {
      results = results.filter((p) => p.category === filters.category)
    }

    if (filters?.priceFrom) {
      results = results.filter((p) => p.price >= filters.priceFrom!)
    }

    if (filters?.priceTo) {
      results = results.filter((p) => p.price <= filters.priceTo!)
    }

    return { data: { products: results, total: results.length } }
  },
}
