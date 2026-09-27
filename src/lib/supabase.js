import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseKey.includes('your-anon-key')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[EcoCollect] Notice: Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set or using placeholders.\n' +
    'Please set these environment variables in your Vercel/Netlify project settings and redeploy.\n' +
    'Demo accounts and local offline mode will still function for previewing the app.'
  )
}

/** @type {import('@supabase/supabase-js').SupabaseClient} */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
)
