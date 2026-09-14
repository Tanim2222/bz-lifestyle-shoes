import type { Product, ProductInput } from "../types";
import { supabase } from "./supabaseClient";

interface ProductRow {
  id: string;
  name: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  image_url: string;
  colorway: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  product_variants: { size: string; stock: number }[];
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    description: row.description,
    imageUrl: row.image_url,
    colorway: row.colorway,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    variants: row.product_variants ?? [],
  };
}

const SELECT_WITH_VARIANTS = "*, product_variants(size, stock)";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_VARIANTS)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapRow);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from("products").select(SELECT_WITH_VARIANTS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as ProductRow) : undefined;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data: productRow, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      category_id: input.categoryId,
      price: input.price,
      compare_at_price: input.compareAtPrice,
      description: input.description,
      image_url: input.imageUrl,
      colorway: input.colorway,
      active: input.active,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (input.variants.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(input.variants.map((v) => ({ product_id: productRow.id, size: v.size, stock: v.stock })));
    if (variantError) throw new Error(variantError.message);
  }

  return mapRow({ ...productRow, product_variants: input.variants });
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const productPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) productPatch.name = patch.name;
  if (patch.categoryId !== undefined) productPatch.category_id = patch.categoryId;
  if (patch.price !== undefined) productPatch.price = patch.price;
  if (patch.compareAtPrice !== undefined) productPatch.compare_at_price = patch.compareAtPrice;
  if (patch.description !== undefined) productPatch.description = patch.description;
  if (patch.imageUrl !== undefined) productPatch.image_url = patch.imageUrl;
  if (patch.colorway !== undefined) productPatch.colorway = patch.colorway;
  if (patch.active !== undefined) productPatch.active = patch.active;

  const { error } = await supabase.from("products").update(productPatch).eq("id", id);
  if (error) throw new Error(error.message);

  if (patch.variants) {
    await supabase.from("product_variants").delete().eq("product_id", id);
    if (patch.variants.length > 0) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(patch.variants.map((v) => ({ product_id: id, size: v.size, stock: v.stock })));
      if (variantError) throw new Error(variantError.message);
    }
  }

  const updated = await getProduct(id);
  if (!updated) throw new Error("Product not found after update.");
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
