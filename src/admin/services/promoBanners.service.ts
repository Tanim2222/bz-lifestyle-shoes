import type { PromoBanner, PromoBannerInput, AccentColor } from "../types";
import { supabase } from "./supabaseClient";

interface PromoBannerRow {
  id: string;
  title: string;
  copy: string;
  cta_label: string;
  href: string;
  image_url: string | null;
  accent_color: AccentColor;
  sort_order: number;
  active: boolean;
}

function mapRow(row: PromoBannerRow): PromoBanner {
  return {
    id: row.id,
    title: row.title,
    copy: row.copy,
    ctaLabel: row.cta_label,
    href: row.href,
    imageUrl: row.image_url,
    accentColor: row.accent_color,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function toRow(input: Partial<PromoBannerInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.copy !== undefined) row.copy = input.copy;
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel;
  if (input.href !== undefined) row.href = input.href;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.accentColor !== undefined) row.accent_color = input.accentColor;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  const { data, error } = await supabase.from("promo_banners").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data as PromoBannerRow[]).map(mapRow);
}

export async function createPromoBanner(input: PromoBannerInput): Promise<PromoBanner> {
  const { data, error } = await supabase.from("promo_banners").insert(toRow(input)).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as PromoBannerRow);
}

export async function updatePromoBanner(id: string, patch: Partial<PromoBannerInput>): Promise<PromoBanner> {
  const { data, error } = await supabase.from("promo_banners").update(toRow(patch)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as PromoBannerRow);
}

export async function deletePromoBanner(id: string): Promise<void> {
  const { error } = await supabase.from("promo_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
