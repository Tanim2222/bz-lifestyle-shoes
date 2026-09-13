import type { AdminUser, Role } from "../types";
import { supabase } from "./supabaseClient";

export interface AdminUserInput {
  name: string;
  email: string;
  role: Role;
  password: string;
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  last_login_at: string | null;
}

function mapRow(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.from("admin_users").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data as AdminUserRow[]).map(mapRow);
}

// Creating a real login needs Supabase's service_role key, which never runs
// in the browser — this calls the local Express server instead (server.ts),
// same pattern as the AI image-generation proxy.
export async function createAdminUser(input: AdminUserInput): Promise<AdminUser> {
  const response = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Failed to create account.");
  return json as AdminUser;
}

export async function toggleAdminUserActive(id: string): Promise<AdminUser> {
  const { data: current, error: fetchError } = await supabase.from("admin_users").select("active").eq("id", id).single();
  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase.from("admin_users").update({ active: !current.active }).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as AdminUserRow);
}
