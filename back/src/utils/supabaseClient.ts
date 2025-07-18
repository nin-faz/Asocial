import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for Storage operations
const supabaseUrl = process.env.SUPABASE_STORAGE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase URL and Service Role Key must be set in environment variables"
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
