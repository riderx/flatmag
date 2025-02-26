import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createShare(state: string) {
  const { data, error } = await supabase
    .from('shares')
    .insert({ state })
    .select('id')
    .single()

  if (error)
    throw error
  return data.id
}

export async function getShare(id: string) {
  const { data, error } = await supabase
    .from('shares')
    .select('state')
    .eq('id', id)
    .single()

  if (error)
    throw error
  return data.state
}
