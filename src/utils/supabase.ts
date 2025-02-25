import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Store active channels
const activeChannels = new Map<string, any>()

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

export function subscribeToChannel(shareId: string, onMessage: (payload: any) => void) {
  // Get or create channel for this share
  let channel = activeChannels.get(shareId)
  if (!channel) {
    channel = supabase.channel(`magazine-${shareId}`)
    activeChannels.set(shareId, channel)
  }

  // Subscribe to changes
  channel
    .on('broadcast', { event: '*' }, ({ event, payload }) => {
      onMessage({ event, data: payload })
    })
    .subscribe()

  return () => {
    channel.unsubscribe()
    activeChannels.delete(shareId)
  }
}

export function broadcastToChannel(shareId: string, event: string, payload: any) {
  const channel = activeChannels.get(shareId)
  if (channel) {
    channel.send({
      type: 'broadcast',
      event,
      payload,
    })
  }
}
