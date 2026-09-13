import type { Promotion, PromotionInput } from "../types";
import { supabase } from "./supabaseClient";

interface PromotionRow {
  id: string;
  code: string;
  description: string;
  discount_type: Promotion["discountType"];
  value: number;
  start_date: string;
  end_date: string;
  active: boolean;
  usage_count: number;
}

function mapRow(row: PromotionRow): Promotion {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    value: Number(row.value),
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active,
    usageCount: row.usage_count,
  };
}

function toRow(input: Partial<PromotionInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.code !== undefined) row.code = input.code;
  if (input.description !== undefined) row.description = input.description;
  if (input.discountType !== undefined) row.discount_type = input.discountType;
  if (input.value !== undefined) row.value = input.value;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function getPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase.from("promotions").select("*").order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as PromotionRow[]).map(mapRow);
}

export async function createPromotion(input: PromotionInput): Promise<Promotion> {
  const { data, error } = await supabase.from("promotions").insert(toRow(input)).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as PromotionRow);
}

export async function updatePromotion(id: string, patch: Partial<PromotionInput>): Promise<Promotion> {
  const { data, error } = await supabase.from("promotions").update(toRow(patch)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as PromotionRow);
}

export async function togglePromotion(id: string): Promise<Promotion> {
  const { data: current, error: fetchError } = await supabase.from("promotions").select("active").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase.from("promotions").update({ active: !current.active }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as PromotionRow);
}

export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
