import type { Category, CategoryInput } from "../types";
import { supabase } from "./supabaseClient";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, patch: Partial<CategoryInput>): Promise<Category> {
  const { data, error } = await supabase.from("categories").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
