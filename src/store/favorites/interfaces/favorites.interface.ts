export interface FavoriteProductData {
  id: string;
  title: string;
  price: number;
  quantity?: number;
  category?: string;
  description?: string;
  images?: string[] | null;
}
