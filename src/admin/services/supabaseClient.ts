import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Loud, early failure beats a silent 401 from every service call.
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Add them to your .env file and restart `npm run dev`."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
