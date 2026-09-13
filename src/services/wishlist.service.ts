import { supabase } from "../admin/services/supabaseClient";

export async function getWishlistProductIds(customerId: string): Promise<string[]> {
  const { data, error } = await supabase.from("wishlist_items").select("product_id").eq("customer_id", customerId);
  if (error) throw new Error(error.message);
  return (data as { product_id: string }[]).map((row) => row.product_id);
}

export async function addToWishlist(customerId: string, productId: string): Promise<void> {
  const { error } = await supabase.from("wishlist_items").insert({ customer_id: customerId, product_id: productId });
  // A duplicate (already-wishlisted) insert violates the unique constraint —
  // that's not a real error from the caller's point of view, ignore it.
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function removeFromWishlist(customerId: string, productId: string): Promise<void> {
  const { error } = await supabase.from("wishlist_items").delete().eq("customer_id", customerId).eq("product_id", productId);
  if (error) throw new Error(error.message);
}
