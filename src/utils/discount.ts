export type DiscountType = "percentage" | "fixed";

// Shared by the cart drawer (preview before checkout) and mirrored
// server-side in server.ts (the authoritative, re-validated calculation at
// payment time) — keep both in sync if this changes.
export function calculateDiscount(subtotal: number, discountType: DiscountType, value: number): number {
  const raw = discountType === "percentage" ? subtotal * (value / 100) : value;
  return Math.round(Math.min(Math.max(raw, 0), subtotal));
}
