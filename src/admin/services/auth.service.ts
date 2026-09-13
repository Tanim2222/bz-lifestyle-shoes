import type { AdminUser } from "../types";
import { supabase } from "./supabaseClient";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
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

export async function login(email: string, password: string): Promise<AdminUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed.");

  const { data: profile, error: profileError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("This account has no admin/staff profile. Ask an admin to add you in Settings.");
  }
  if (!profile.active) {
    await supabase.auth.signOut();
    throw new Error("This account has been deactivated.");
  }

  await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", profile.id);

  return mapRow({ ...profile, last_login_at: new Date().toISOString() });
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// Used on app load to restore a session that already exists (page refresh).
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data: profile } = await supabase.from("admin_users").select("*").eq("id", userId).maybeSingle();
  if (!profile || !profile.active) return null;

  return mapRow(profile);
}
