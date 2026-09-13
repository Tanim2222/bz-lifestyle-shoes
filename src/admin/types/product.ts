export interface ProductVariant {
  size: string; // e.g. "US 9.5"
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  imageUrl: string;
  colorway: string;
  variants: ProductVariant[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type CategoryInput = Omit<Category, "id">;
