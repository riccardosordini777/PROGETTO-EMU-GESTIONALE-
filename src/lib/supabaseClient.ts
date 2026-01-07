import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG: Log the URL to verify it's loaded correctly
console.log('Attempting to connect to Supabase with URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)