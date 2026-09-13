import type { InventoryLog, Product } from "../types";
import { supabase } from "./supabaseClient";
import { getProduct } from "./products.service";

export interface InventoryRow {
  productId: string;
  productName: string;
  colorway: string;
  size: string;
  stock: number;
  lowStock: boolean;
}

export const LOW_STOCK_THRESHOLD = 5;

interface VariantJoinRow {
  product_id: string;
  size: string;
  stock: number;
  products: { name: string; colorway: string } | null;
}

interface InventoryLogRow {
  id: string;
  product_id: string;
  product_name: string;
  size: string;
  change: number;
  resulting_stock: number;
  reason: string;
  adjusted_by: string;
  created_at: string;
}

function mapLogRow(row: InventoryLogRow): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    size: row.size,
    change: row.change,
    resultingStock: row.resulting_stock,
    reason: row.reason,
    adjustedBy: row.adjusted_by,
    createdAt: row.created_at,
  };
}

export async function getInventory(): Promise<InventoryRow[]> {
  const { data, error } = await supabase.from("product_variants").select("product_id, size, stock, products(name, colorway)");
  if (error) throw new Error(error.message);

  return (data as unknown as VariantJoinRow[]).map((row) => ({
    productId: row.product_id,
    productName: row.products?.name ?? "",
    colorway: row.products?.colorway ?? "",
    size: row.size,
    stock: row.stock,
    lowStock: row.stock <= LOW_STOCK_THRESHOLD,
  }));
}

export async function getInventoryLogs(): Promise<InventoryLog[]> {
  const { data, error } = await supabase.from("inventory_logs").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as InventoryLogRow[]).map(mapLogRow);
}

export async function adjustStock(
  productId: string,
  size: string,
  change: number,
  reason: string,
  adjustedBy: string
): Promise<{ product: Product; log: InventoryLog }> {
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, stock")
    .eq("product_id", productId)
    .eq("size", size)
    .single();
  if (variantError) throw new Error(variantError.message);

  const newStock = Math.max(0, variant.stock + change);
  const { error: updateError } = await supabase.from("product_variants").update({ stock: newStock }).eq("id", variant.id);
  if (updateError) throw new Error(updateError.message);

  const product = await getProduct(productId);
  if (!product) throw new Error("Product not found.");

  await supabase.from("products").update({ updated_at: new Date().toISOString() }).eq("id", productId);

  const { data: logRow, error: logError } = await supabase
    .from("inventory_logs")
    .insert({
      product_id: productId,
      product_name: `${product.name} ${product.colorway}`,
      size,
      change,
      resulting_stock: newStock,
      reason,
      adjusted_by: adjustedBy,
    })
    .select()
    .single();
  if (logError) throw new Error(logError.message);

  const updatedProduct = await getProduct(productId);
  return { product: updatedProduct ?? product, log: mapLogRow(logRow as InventoryLogRow) };
}
