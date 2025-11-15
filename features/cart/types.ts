import type { StaticImageData } from "next/image";

export interface Cart {
  message: string;
  data: CartItem[];
  errorDetails?: string;
  total?: number;
  total_formatted?: string;
  items?: CartItem[]; // Alternative structure
}

export interface Order {
  id: number;
  seller: {
    id: number;
    name: string;
  };
  items: CartItem[];
  billing: {
    body: Array<{ title: string; value: string }>;
    footer: { title: string; value: string };
  };
}

export interface Region {
  id: number;
  code: string;
  name: string;
}

export interface Address {
  id: number;
  title: string;
  region_id: number;
  address: string;
  phone?: string;
  is_default?: boolean;
}

export interface PickUpPoint {
  id: number;
  name: string;
  address: string;
}

export interface PaymentTypeOption {
  id: number;
  name: string;
  code: string;
}

export interface CartTranslations {
  cart: string;
  ordersIn: string;
  pricePerUnit: string;
  additionalPrice: string;
  discount: string;
  totalPrice: string;
  paymentType: string;
  cash: string;
  card: string;
  deliveryType: string;
  delivery: string;
  pickup: string;
  selectRegion: string;
  selectAddress: string;
  note: string;
  placeOrder: string;
  emptyCart: string;
  map: string;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data: T;
  errorDetails?: string;
}

export interface CreateOrderPayload {
  customer_name?: string;
  customer_phone?: string;
  customer_address: string;
  shipping_method: string;
  payment_type_id: number;
  delivery_time?: string;
  delivery_at?: string;
  region: string;
  note?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    description?: string;
    media?: Array<{ images_800x800?: string; thumbnail?: string }>;
    channel?: Array<{ id: number; name: string }>;
    price_amount?: string;
    stock?: number;
  };
  product_quantity: number;
  quantity?: number; // For compatibility
  seller?: {
    id: number;
    name: string;
  };
  price?: number;
  total?: number;
  price_formatted?: string;
  sub_total_formatted?: string;
  discount_formatted?: string;
  total_formatted?: string;
}

export interface Province {
  id: number;
  region: string;
  name: string;
}

export interface PaymentType {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  seller: {
    id: number;
    name: string;
  };
  items: CartItem[];
  billing: {
    body: Array<{ title: string; value: string }>;
    footer: { title: string; value: string };
  };
}

export interface CartTranslations {
  cart: string;
  ordersIn: string;
  pricePerUnit: string;
  additionalPrice: string;
  discount: string;
  totalPrice: string;
  paymentType: string;
  cash: string;
  card: string;
  deliveryType: string;
  delivery: string;
  pickup: string;
  selectRegion: string;
  selectAddress: string;
  note: string;
  placeOrder: string;
  emptyCart: string;
  map: string;
}

export type DeliveryType = "SELECTED_DELIVERY" | "PICK_UP";

export interface CreateOrderPayload {
  customer_address: string;
  shipping_method: string;
  payment_type_id: number;
  region: string;
  note?: string;
}
