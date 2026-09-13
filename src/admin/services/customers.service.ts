import type { Customer } from "../types";
import { supabase } from "./supabaseClient";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined_at: string;
  total_orders: number;
  total_spent: number;
}

function mapRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    joinedAt: row.joined_at,
    totalOrders: row.total_orders,
    totalSpent: Number(row.total_spent),
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("joined_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as CustomerRow[]).map(mapRow);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as CustomerRow) : undefined;
}
