import { supabase } from "../admin/services/supabaseClient";
import type { CustomerProfile } from "../types/customerAccount";

interface CustomerRow {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone: string;
  shoe_size_preference: string | null;
}

function mapRow(row: CustomerRow): CustomerProfile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    shoeSizePreference: row.shoe_size_preference ?? "",
  };
}

// The Auth user is created server-side (service_role, pre-confirmed email —
// see /api/customers/signup) so this is only the second half: establish a
// real browser session for the account that now exists.
export async function signUp(name: string, email: string, password: string, phone: string): Promise<CustomerProfile> {
  const response = await fetch("/api/customers/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Could not create your account.");

  return signIn(email, password);
}

export async function signIn(email: string, password: string): Promise<CustomerProfile> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await getCurrentCustomer();
  if (!profile) throw new Error("Signed in, but no matching customer profile was found.");
  return profile;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Supabase emails a recovery link that lands back on /reset-password with a
// token in the URL; the client picks that up automatically and starts a
// recovery session there, where the user sets a new password.
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// Used on app load to restore a session that already exists (page refresh).
export async function getCurrentCustomer(): Promise<CustomerProfile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data: profile } = await supabase.from("customers").select("*").eq("auth_user_id", userId).maybeSingle();
  return profile ? mapRow(profile as CustomerRow) : null;
}

export async function updateProfile(
  id: string,
  updates: { name?: string; phone?: string; shoeSizePreference?: string }
): Promise<CustomerProfile> {
  const patch: Record<string, string> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.shoeSizePreference !== undefined) patch.shoe_size_preference = updates.shoeSizePreference;

  const { data, error } = await supabase.from("customers").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return mapRow(data as CustomerRow);
}
