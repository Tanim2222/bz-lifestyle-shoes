import type { ShopCategory, ShopCategoryInput } from "../types";
import { supabase } from "./supabaseClient";

interface ShopCategoryRow {
  id: string;
  label: string;
  image_url: string | null;
  href: string;
  sort_order: number;
  active: boolean;
}

function mapRow(row: ShopCategoryRow): ShopCategory {
  return {
    id: row.id,
    label: row.label,
    imageUrl: row.image_url,
    href: row.href,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function toRow(input: Partial<ShopCategoryInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.label !== undefined) row.label = input.label;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.href !== undefined) row.href = input.href;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function getShopCategories(): Promise<ShopCategory[]> {
  const { data, error } = await supabase.from("shop_categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data as ShopCategoryRow[]).map(mapRow);
}

export async function createShopCategory(input: ShopCategoryInput): Promise<ShopCategory> {
  const { data, error } = await supabase.from("shop_categories").insert(toRow(input)).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as ShopCategoryRow);
}

export async function updateShopCategory(id: string, patch: Partial<ShopCategoryInput>): Promise<ShopCategory> {
  const { data, error } = await supabase.from("shop_categories").update(toRow(patch)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as ShopCategoryRow);
}

export async function deleteShopCategory(id: string): Promise<void> {
  const { error } = await supabase.from("shop_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
