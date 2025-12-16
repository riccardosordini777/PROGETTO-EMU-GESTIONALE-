import { createClient } from '@supabase/supabase-js'

// Assicurati che ci sia https:// all'inizio!
const supabaseUrl = 'https://obosxrxnkpbaefwyoghu.supabase.co'
const supabaseAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib3N4cnhua3BiYWVmd3lvZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzMyNTEsImV4cCI6MjA4MTQwOTI1MX0.n0hde7ESz1rnuOuTf_QWSe4G_zwKb7sDd6jIMAIxX5Y'

export const supabase = createClient(supabaseUrl, supabaseAnon)