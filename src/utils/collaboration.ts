import { getMagazineStore } from '../store/mainStore'
import { getRandomAnimal } from './animals'
import { supabase } from './supabase'

export interface User {
  id: string
  animal: {
    name: string
    color: string
  }
}

interface MessagePayload {
  event: string
  data: Record<string, unknown>
}

// Initialize user ID and animal from localStorage or create new ones
const storedUser = localStorage.getItem('flatmag_user')
let userId = storedUser ? JSON.parse(storedUser).id : Math.random().toString(36).substr(2, 9)
let userAnimal = storedUser ? JSON.parse(storedUser).animal : getRandomAnimal()

// Save user to localStorage
if (!storedUser) {
  localStorage.setItem('flatmag_user', JSON.stringify({ id: userId, animal: userAnimal }))
}

let connectedUsers: User[] = [{ id: userId, animal: userAnimal }]
let currentShareId: string | null = null
let messageChannel: any = null
let presenceChannel: any = null
let isEditAllowed = true

// Flag to track most recent broadcast IDs to prevent sync loops
const recentBroadcastIds: Record<string, number> = {}

export function initializeCollaboration() {
  if (!userId) {
    userId = Math.random().toString(36).substr(2, 9)
    userAnimal = getRandomAnimal()
  }

  // Add current user to connected users
  connectedUsers = [{
    id: userId,
    animal: userAnimal,
  }]
}

export async function joinSession(shareId: string, allowEdit: boolean) {
  // Clean up any existing subscription
  if (messageChannel) {
    messageChannel.unsubscribe()
    messageChannel = null
  }

  // Clean up existing presence channel
  if (presenceChannel) {
    presenceChannel.untrack()
    presenceChannel.unsubscribe()
    presenceChannel = null
  }

  currentShareId = shareId
  isEditAllowed = allowEdit
  initializeCollaboration()

  console.log('[Collaboration] Joining session:', shareId, 'with user:', { id: userId, animal: userAnimal })

  // Create presence channel for user tracking
  presenceChannel = supabase.channel(`presence-${shareId}`)

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState()
      console.log('[Collaboration] Presence SYNC event - users:', Object.keys(state).length)

      // Convert presence state to user array
      const users = Object.values(state)
        .flat()
        .map((presence: any) => presence.user as User)

      // Update connected users
      connectedUsers = users
    })
    .on('presence', { event: 'join' }, ({ newPresences }: { key: string, newPresences: any[] }) => {
      // Add new users to connected users
      const newUsers = newPresences.map((p: any) => p.user as User)
      const currentUserIds = connectedUsers.map(u => u.id)

      newUsers.forEach((user) => {
        if (!currentUserIds.includes(user.id)) {
          connectedUsers.push(user)
        }
      })
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }: { key: string, leftPresences: any[] }) => {
      // Remove users who left
      const leftUserIds = leftPresences.map((p: any) => p.user.id)
      connectedUsers = connectedUsers.filter(user => !leftUserIds.includes(user.id))
    })
    .subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // Track our presence
        await presenceChannel.track({
          user: {
            id: userId,
            animal: userAnimal,
          },
        })
      }
    })

  // Subscribe to a single stable channel for all messages
  messageChannel = supabase.channel(`magazine-${shareId}`)

  messageChannel
    .on('broadcast', { event: '*' }, ({ event, payload }: { event: string, payload: any }) => {
      console.log(`[Collaboration] Received ${event} event from ${payload?.user?.id}`)

      // Skip processing if message is from self
      if (payload?.user?.id === userId) {
        console.log('[Collaboration] Ignoring message from self')
        return
      }

      // Skip if we've seen this broadcast ID recently (prevents loops)
      const broadcastId = payload?.broadcastId
      if (broadcastId && recentBroadcastIds[broadcastId]) {
        console.log('[Collaboration] Ignoring duplicate broadcast:', broadcastId)
        return
      }

      // Store broadcast ID to prevent reprocessing
      if (broadcastId) {
        recentBroadcastIds[broadcastId] = Date.now()

        // Clean up old broadcast IDs (older than 10 seconds)
        const now = Date.now()
        Object.keys(recentBroadcastIds).forEach((id) => {
          if (now - recentBroadcastIds[id] > 10000) {
            delete recentBroadcastIds[id]
          }
        })
      }

      handleMessage({ event, data: payload })
    })
    .subscribe((status: string) => {
      console.log('[Collaboration] Message channel subscription status:', status)
    })

  return () => {
    leaveSession()
  }
}

export async function leaveSession() {
  if (currentShareId) {
    // Untrack presence
    if (presenceChannel) {
      presenceChannel.untrack()
      presenceChannel.unsubscribe()
      presenceChannel = null
    }

    // Cleanup message channel
    if (messageChannel) {
      messageChannel.unsubscribe()
      messageChannel = null
    }

    currentShareId = null
    connectedUsers = [{ id: userId, animal: userAnimal }]
  }
}

function handleMessage(payload: MessagePayload) {
  const { event, data } = payload

  if (!isEditAllowed) {
    console.log('[Collaboration] Edit not allowed, ignoring message:', event)
    return
  }

  const magazineStore = getMagazineStore()
  if (!magazineStore) {
    console.error('[Collaboration] Failed to handle message: magazineStore not available')
    return
  }

  switch (event) {
    case 'state:update':
      handleStateUpdate(data as { allowEdit: boolean })
      break

    case 'article:add': {
      console.log('[Collaboration] Applying new article:', (data as any).article.id)
      const articleCopy = JSON.parse(JSON.stringify((data as any).article))
      articleCopy._remoteSync = true
      // Use addArticle function for new articles
      magazineStore.addArticle(articleCopy)
      break
    }

    case 'article:reorder':
      console.log('[Collaboration] Applying article reorder')
      magazineStore.reorderArticles(data.articles as any[], data.user as User, false)
      break

    case 'article:update': {
      console.log('[Collaboration] Applying article update:', (data as any).article.id)
      const articleCopy = JSON.parse(JSON.stringify((data as any).article))
      articleCopy._remoteSync = true
      magazineStore.updateArticle(articleCopy, undefined, data.user as User, false)
      break
    }

    case 'article:delete':
      console.log('[Collaboration] Applying article delete:', (data as any).articleId)
      magazineStore.deleteArticle((data as any).articleId, data.user as User, false)
      break

    case 'magazine:update': {
      console.log('[Collaboration] Applying magazine settings update', {
        pages: (data as any).settings.pages,
        title: (data as any).settings.title,
        historyOp: (data as any).settings._historyOperation || 'none',
        hasTimestamp: !!(data as any).settings._broadcast_timestamp,
      })

      // Force synchronous update with a deep-cloned settings object
      const settingsCopy = JSON.parse(JSON.stringify((data as any).settings))

      // Add a timestamp to ensure Vue detects the change
      settingsCopy._updateTimestamp = Date.now()

      magazineStore.syncMagazineSettings(settingsCopy, false)
      break
    }

    default:
      console.log('Unknown event:', event)
  }
}

function handleStateUpdate(data: { allowEdit: boolean }) {
  isEditAllowed = data.allowEdit

  const magazineStore = getMagazineStore()
  if (magazineStore) {
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit: data.allowEdit,
      shareId: currentShareId,
    })
  }
}

// Update edit status without leaving the session
export function updateEditStatus(allowEdit: boolean) {
  isEditAllowed = allowEdit
  broadcastStateUpdate(allowEdit)
}

// This function will be called from a component that uses the store
export function updateShareStatus(allowEdit: boolean) {
  const magazineStore = getMagazineStore()
  if (magazineStore) {
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit,
      shareId: currentShareId,
    })
    broadcastStateUpdate(allowEdit)
  }
}

// Simplified broadcast function used by all other broadcast methods
function broadcast(event: string, payload: any) {
  if (!currentShareId || !messageChannel) {
    console.error('[Collaboration] Cannot broadcast - no active session')
    return Promise.reject(new Error('No active session'))
  }

  // Add standard fields to all payloads
  const fullPayload = {
    ...payload,
    user: { id: userId, animal: userAnimal },
    timestamp: Date.now(),
    broadcastId: `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  }

  console.log(`[Collaboration] Broadcasting ${event}`)

  return messageChannel.send({
    type: 'broadcast',
    event,
    payload: fullPayload,
  }).then(() => {
    console.log(`[Collaboration] ${event} sent successfully`)

    // Store our own broadcast ID to prevent loop processing
    recentBroadcastIds[fullPayload.broadcastId] = Date.now()
    return true
  }).catch((error: Error) => {
    console.error(`[Collaboration] Failed to send ${event}:`, error)
    return false
  })
}

// Simplified broadcast functions for various operations
export function broadcastArticleReorder(articles: any[]) {
  if (!currentShareId)
    return

  const cleanArticles = articles.map((article) => {
    const cleaned = JSON.parse(JSON.stringify(article))
    // Remove any temporary properties
    delete (cleaned as any)._dragTimeStamp
    delete (cleaned as any)._lastUpdated
    delete (cleaned as any)._remoteSync
    return cleaned
  })

  broadcast('article:reorder', { articles: cleanArticles })
}

export function broadcastArticleUpdate(article: any) {
  if (!currentShareId)
    return

  // Create clean copy for broadcasting
  const cleanedArticle = JSON.parse(JSON.stringify(article))

  // Log what we're broadcasting
  console.log('[Collaboration] Broadcasting article update:', {
    id: cleanedArticle.id,
    title: cleanedArticle.title,
    hasVisuals: (cleanedArticle.visuals || []).length > 0,
    titleChanged: cleanedArticle._titleChanged,
    hasTimestamp: !!cleanedArticle._broadcastTimestamp,
  })

  // Add our own broadcast timestamp to ensure it's processed
  cleanedArticle._collaboration_timestamp = Date.now()

  // Remove only the temporary properties that shouldn't be sent
  delete (cleanedArticle as any)._dragTimeStamp
  delete (cleanedArticle as any)._lastUpdated
  delete (cleanedArticle as any)._remoteSync

  // Important: don't delete broadcastTimestamp as it's needed to flag this as requiring broadcast
  // on the receiving end

  broadcast('article:update', { article: cleanedArticle })
}

export function broadcastArticleDelete(articleId: string) {
  if (!currentShareId)
    return
  broadcast('article:delete', { articleId })
}

export function broadcastArticleAdd(article: any) {
  if (!currentShareId)
    return

  // Create clean copy for broadcasting
  const cleanedArticle = JSON.parse(JSON.stringify(article))

  // Log what we're broadcasting
  console.log('[Collaboration] Broadcasting new article:', {
    id: cleanedArticle.id,
    title: cleanedArticle.title,
  })

  // Add our own broadcast timestamp to ensure it's processed
  cleanedArticle._collaboration_timestamp = Date.now()
  cleanedArticle._newArticle = true

  // Remove any temporary properties that shouldn't be sent
  delete (cleanedArticle as any)._dragTimeStamp
  delete (cleanedArticle as any)._lastUpdated
  delete (cleanedArticle as any)._remoteSync

  broadcast('article:add', { article: cleanedArticle })
}

export function broadcastMagazineSettings(settings: any) {
  if (!currentShareId)
    return

  console.log('[Collaboration] Broadcasting magazine settings:', {
    title: settings.title,
    pages: settings.pages,
    historyOp: settings._historyOperation || 'direct update',
    timestamp: Date.now(),
  })

  // Create clean copy without temp properties
  const cleanSettings = JSON.parse(JSON.stringify(settings))

  // Add a timestamp to ensure receiving end recognizes it as new
  cleanSettings._broadcast_timestamp = Date.now()

  broadcast('magazine:update', { settings: cleanSettings })
}

export function broadcastStateUpdate(allowEdit: boolean) {
  if (!currentShareId)
    return
  broadcast('state:update', { allowEdit })
}

export const getSessionId = () => userId
export const getSessionUser = () => ({ id: userId, animal: userAnimal })
export const isCollaborating = () => !!currentShareId
export const getConnectedPeers = () => connectedUsers.length - 1
export const getConnectedUsers = () => [...connectedUsers] // Return a copy to prevent mutations
export const isEditingAllowed = () => isEditAllowed
