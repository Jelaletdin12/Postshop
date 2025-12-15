/**
 * API Response and Entity Type Definitions
 */

// Product Types
export interface ProductMedia {
  thumbnail: string;
  images_400x400: string;
  images_720x720: string;
  images_800x800: string;
  images_1200x1200: string;
  
}

export type DeliveryType = "SELECTED_DELIVERY" | "PICK_UP";

export interface PaymentType {
  id: number;
  name: string;
  code?: string;
}

export interface ProductProperty {
  attribute_id: number;
  name: string;
  value: string;
}

export interface ProductReviews {
  count: number;
  rating: string;
}

export interface ProductBrand {
  id: number | null;
  name: string | null;
}

export interface ProductChannel {
  id: number;
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface Product {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  barcode: string;
  stock: number;
  price_amount: string;
  old_price_amount: string | null;
  backorder: string;
  weight_value: number | null;
  weight_unit: string | null;
  height_value: number | null;
  height_unit: string | null;
  media: ProductMedia[];
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
  is_visible: boolean;
  colour: string | null;
  size: string | null;
  available_colors?: string[];
  available_sizes?: string[];
  brand: ProductBrand;
  channel?: ProductChannel[];
  properties?: ProductProperty[];
  variations?: any[];
  reviews: ProductReviews;
  reviews_resources?: any[];
  categories?: ProductCategory[];
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  parent_id?: number | null;
  children?: Category[];
  media:ProductMedia[];
  
}

// Collection Types
export interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at?: string;
  media?: ProductMedia[];
}

// Cart Types
export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  price_amount: string;
  old_price_amount: string | null;
  media?: ProductMedia[];
  channel?: ProductChannel[];
  stock: number;
  image?: string;
  images?: string[];
}

export interface CartItem {
  id: number;
  product_id: number;
  product: CartProduct;
  product_quantity: number;
  seller?: {
    id: number;
    name: string;
  };
  quantity: number;
  price: number;
  total: number;
  price_formatted: string;
  sub_total_formatted: string;
  total_formatted: string;
  discount_formatted: string;
}

export interface CartResponse {
  message?: string;
  data: CartItem[];
  count?: number;
  total?: number;
  total_formatted?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  total_formatted?: string;
  count?: number;
}

// Favorites Types
export interface Favorite {
  id?: number;
  product_id: number;
  product: Product;
  added_at?: string;
  created_at?: string;
}

// Order Types
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

// Pagination Types
export interface Pagination {
  page: number;
  perPage: number;
  count: number;
  first_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  hasMorePages?: boolean;
}

export interface PaginatedResponse<T> {
  message?: string;
  data: T[];
  pagination: Pagination;
}

// Search Types
export interface SearchFilters {
  q?: string;
  category_id?: number;
  brand_id?: number;
  price_from?: number;
  price_to?: number;
  page?: number;
  per_page?: number;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  filters?: {
    brands: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
    price_range: { min: number; max: number };
  };
}

// User Profile Types
export interface UserProfile {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  email?: string;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: UserProfile;
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginRequest {
  phone_number: string;
}

export interface VerifyTokenRequest {
  phone_number: string;
  code: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
}

export interface VerifyTokenResponse {
  message: string;
  token: string;
  user: UserProfile;
}

// Banner Types
export interface Banner {
  id: number;
  title: string;
  image: string;
  thumbnail?: string;
  link?: string;
  url?: string;
  type?: string;
  place?: string;
}

// Region and Province Types
export interface Region {
  id: number;
  code: string;
  name: string;
  region: string;
}

export interface Province {
  id: number;
  name: string;
  region: string;
  code?: string;
}

// Address Types
export interface Address {
  id: number;
  title: string;
  region_id: number;
  address: string;
  phone?: string;
  is_default?: boolean;
}

// Payment Type Options
export interface PaymentTypeOption {
  id: number;
  name: string;
  code: string;
}

// Shipping Method Types
export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
}

// Generic API Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  success?: boolean;
}

// Add to Cart Request
export interface AddToCartRequest {
  productId: number;
  quantity?: number;
}

// Update Cart Item Quantity Request
export interface UpdateCartItemQuantityRequest {
  productId: number;
  quantity: number;
}

// Remove from Cart Request
export interface RemoveFromCartRequest {
  productId: number;
}

// Add to Favorites Request
export interface AddToFavoritesRequest {
  productId: number;
}

// Remove from Favorites Request
export interface RemoveFromFavoritesRequest {
  productId: number;
}

// Cancel Order Request
export interface CancelOrderRequest {
  orderId: number;
}

// Order Summary for Cart Page
export interface OrderBillingItem {
  title: string;
  value: string;
}

export interface OrderBilling {
  body: OrderBillingItem[];
  footer: {
    title: string;
    value: string;
  };
}

export interface OrderSummary {
  id: number;
  seller: {
    id: number;
    name: string;
  };
  items: CartItem[];
  billing: OrderBilling;
}

// Category Products Response
export interface CategoryProductsResponse {
  message?: string;
  data: Product[];
  pagination?: Pagination;
}

// Query Options for Hooks
export interface QueryOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
}

// User Store Data
export interface UserOrderData {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
}

// lib/types/api.ts içine eklenecek tipler

export interface FilterBrand {
  id: number;
  name: string;
}

export interface FilterCategory {
  id: number;
  parent_id: number;
  name: string;
}

export interface FiltersResponse {
  message: string;
  data: {
    categories: FilterCategory[];
    brands: FilterBrand[];
  };
}


export interface ProductFilters {
  brands?: number[];
  categories?: number[];
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  collection_id?: number; 
}
