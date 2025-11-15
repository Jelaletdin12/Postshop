export interface OrderProduct {
  id: number;
  name: string;
  thumbnail: string;
  images_400x400: string;
  images_800x800: string;
  images_1200x1200: string;
}

export interface OrderItem {
  product: OrderProduct;
  order: {
    id: number;
  };
  quantity: number;
  unit_price_amount: string;
}

export interface Order {
  id: number;
  status: string;
  shipping_method: string;
  notes: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_time: string;
  delivery_at: string;
  region: string;
  user_id: number;
  province_id: number | null;
  payment_type: string;
  orderItems: OrderItem[];
}

export interface OrdersResponse {
  message: string;
  data: Order[];
  pagination: {
    page: number;
    perPage: number;
    count: number;
    first_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shipping_method: string;
  payment_type_id: number;
  delivery_time?: string;
  delivery_at?: string;
  region: string;
  note?: string;
}