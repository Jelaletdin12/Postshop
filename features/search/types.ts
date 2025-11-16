// Search Types
export interface SearchProduct {
  id: number;
  name: string;
  stock: number;
  cost_amount: string;
  price_amount: string;
  brand: {
    id: number;
    name: string;
  };
  thumbnail: string;
  media: Array<{
    thumbnail: string;
    images_400x400: string;
    images_720x720: string;
    images_800x800: string;
    images_1200x1200: string;
  }>;
}

export interface SearchResponse {
  message: string;
  data: SearchProduct[];
}

export interface SearchParams {
  q?: string;
  barcode?: string;
}