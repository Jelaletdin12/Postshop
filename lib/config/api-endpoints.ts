/**
 * API Endpoints Configuration
 * Centralized mapping of all API endpoints
 */

export const API_ENDPOINTS = {
  // Products
  products: "/api/v1/products",
  productDetail: (id: string | number) => `/api/v1/products/${id}`,
  productsByCategory: (categoryId: string | number) => `/api/v1/categories/${categoryId}/products`,
  productsByBrand: (brandId: string | number) => `/api/v1/brands/${brandId}/products`,

  // Categories
  categories: "/api/v1/categories",
  categoryDetail: (id: string | number) => `/api/v1/categories/${id}`,

  // Search & Filters
  search: "/api/v1/search",
  filters: "/api/v1/filters",

  // Cart
  cart: "/api/v1/carts",
  cartItems: "/api/v1/carts",
  cartItem: (itemId: string | number) => `/api/v1/carts/${itemId}`,

  // Favorites
  favorites: "/api/v1/favorites",
  favoriteDetail: (productId: string | number) => `/api/v1/favorites/${productId}`,

  // Orders
  orders: "/api/v1/orders",
  orderDetail: (id: string | number) => `/api/v1/orders/${id}`,
  cancelOrder: (id: string | number) => `/api/v1/orders/${id}/cancel`,

  // Regions & Addresses
  regions: "/api/v1/regions",
  addresses: "/api/v1/addresses",

  // Payment & Shipping
  paymentTypes: "/api/v1/order-payments",
  shippingMethods: "/api/v1/shipping-methods",

  // Profile
  profile: "/api/v1/profile",
  profileMe: "/api/v1/me",

  // Auth
  guestToken: "/api/v1/auth/guest-token",
  verifyCode: "/api/v1/auth/verify-code",

  // Media
  banners: "/api/v1/media/banners",

  // Forms
  newsletter: "/api/v1/forms/newsletter-subscription",
  contactUs: "/api/v1/forms/contact-us",
  openStore: "/api/v1/forms/open-store",
} as const
