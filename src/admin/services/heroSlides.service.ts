import type { HeroSlide, HeroSlideInput, AccentColor } from "../types";
import { supabase } from "./supabaseClient";

interface HeroSlideRow {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  image_url: string | null;
  video_url: string | null;
  is_3d: boolean;
  accent_color: AccentColor;
  sort_order: number;
  active: boolean;
}

function mapRow(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    is3d: row.is_3d,
    accentColor: row.accent_color,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function toRow(input: Partial<HeroSlideInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.eyebrow !== undefined) row.eyebrow = input.eyebrow;
  if (input.title !== undefined) row.title = input.title;
  if (input.subtitle !== undefined) row.subtitle = input.subtitle;
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) row.cta_href = input.ctaHref;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.videoUrl !== undefined) row.video_url = input.videoUrl;
  if (input.is3d !== undefined) row.is_3d = input.is3d;
  if (input.accentColor !== undefined) row.accent_color = input.accentColor;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data as HeroSlideRow[]).map(mapRow);
}

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const { data, error } = await supabase.from("hero_slides").insert(toRow(input)).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as HeroSlideRow);
}

export async function updateHeroSlide(id: string, patch: Partial<HeroSlideInput>): Promise<HeroSlide> {
  const { data, error } = await supabase.from("hero_slides").update(toRow(patch)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as HeroSlideRow);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
