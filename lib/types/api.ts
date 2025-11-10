/**
 * API Response and Entity Type Definitions
 * Based on Postman collection structure
 */

// Product Types
export interface Product {
  id: number
  name: string
  slug?: string
  price: number
  description: string
  image: string
  images?: string[]
  category: string
  brand?: string
  stock?: number
  rating?: number
  reviews_count?: number
  is_favorite?: boolean
  is_in_cart?: boolean
  labels?: Array<{ text: string; bg_color: string }>
  struct_price_text?: string
}

// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  image: string
  parent_id?: number
  children?: Category[]
}

// Cart Types
export interface CartItem {
  id: number
  product_id: number
  product?: Product
  seller: {
    id: number
    name: string
  }
  quantity: number
  price: number
  total: number
  price_formatted?: string
  sub_total_formatted?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  total_formatted?: string
  count?: number
}

// Favorites Types
export interface Favorite {
  id: number
  product_id: number
  product?: Product
  added_at?: string
}

// Order Types
export interface OrderItem {
  id: number
  product_id: number
  product?: Product
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: number
  number?: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total: number
  total_formatted?: string
  created_at: string
  updated_at?: string
  estimated_delivery?: string
  tracking_number?: string
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Search Types
export interface SearchFilters {
  q?: string
  category_id?: number
  brand_id?: number
  price_from?: number
  price_to?: number
  page?: number
  per_page?: number
}

export interface SearchResponse {
  products: Product[]
  total: number
  filters?: {
    brands: Array<{ id: number; name: string }>
    categories: Array<{ id: number; name: string }>
    price_range: { min: number; max: number }
  }
}

// Profile Types
export interface UserProfile {
  id: number
  email: string
  phone?: string
  first_name?: string
  last_name?: string
  avatar?: string
  created_at: string
}

// Auth Types
export interface AuthResponse {
  token: string
  user: UserProfile
}

// Banner Types
export interface Banner {
  id: number
  title: string
  image: string
  url?: string
  type?: string
  place?: string
}

// Generic API Error Response
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// Region, Address, PaymentType, and ShippingMethod Types
export interface Region {
  id: number
  code: string
  name: string
}

export interface Address {
  id: number
  title: string
  region_id: number
  address: string
  phone?: string
  is_default?: boolean
}

export interface PaymentTypeOption {
  id: number
  name: string
  code: string
}

export interface ShippingMethod {
  id: number
  name: string
  code: string
}

// Order creation payload type
export interface CreateOrderPayload {
  customer_name?: string
  customer_phone?: string
  customer_address: string
  shipping_method: string
  payment_type_id: number
  delivery_time?: string
  delivery_at?: string
  region: string
  note?: string
}
