import type { StaticImageData } from "next/image"

export interface CartItem {
  id: number
  product_id: number
  product: {
    id: number
    name: string
    description?: string
    images: (StaticImageData | string)[]
    image?: StaticImageData | string
    stock?: number
    price_amount?: string
  }
  seller: {
    id: number
    name: string
  }
  quantity: number
  product_quantity?: number // For compatibility with old API
  price: number
  total: number
  price_formatted?: string
  sub_total_formatted?: string
  discount_formatted?: string
  total_formatted?: string
}

export interface Cart {
  message: string
  data: CartItem[]
  errorDetails?: string
  total?: number
  total_formatted?: string
  items?: CartItem[] // Alternative structure
}

export interface Order {
  id: number
  seller: {
    id: number
    name: string
  }
  items: CartItem[]
  billing: {
    body: Array<{ title: string; value: string }>
    footer: { title: string; value: string }
  }
}

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

export interface PickUpPoint {
  id: number
  name: string
  address: string
}

export interface PaymentTypeOption {
  id: number
  name: string
  code: string
}

export interface CartTranslations {
  cart: string
  ordersIn: string
  pricePerUnit: string
  additionalPrice: string
  discount: string
  totalPrice: string
  paymentType: string
  cash: string
  card: string
  deliveryType: string
  delivery: string
  pickup: string
  selectRegion: string
  selectAddress: string
  note: string
  placeOrder: string
  emptyCart: string
  map: string
}

export type PaymentType = "CASH" | "CARD"
export type DeliveryType = "SELECTED_DELIVERY" | "PICK_UP"

// API Response types
export interface ApiResponse<T> {
  message: string
  data: T
  errorDetails?: string
}

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