export interface Product {
  id?: number;
  name: string;
  img: string;
  price: number;
  category?: string;
  description?: string;
  inStock?: boolean;
}
