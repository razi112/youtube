import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL is not set. " +
      "Add it to your .env file. Get it from https://supabase.com → Project Settings → API."
  );
}

if (!supabaseAnonKey || supabaseAnonKey === "your_supabase_anon_key") {
  console.warn(
    "[Supabase] VITE_SUPABASE_ANON_KEY is not set. " +
      "Add it to your .env file. Get it from https://supabase.com → Project Settings → API."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
