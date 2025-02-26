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
let unsubscribeFunction: (() => void) | null = null
let isEditAllowed = true
let presenceChannel: any = null

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
  if (unsubscribeFunction) {
    unsubscribeFunction()
    unsubscribeFunction = null
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

  // Create presence channel for user tracking
  presenceChannel = supabase.channel(`presence-${shareId}`)

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState()
      // Convert presence state to user array
      const users = Object.values(state)
        .flat()
        .map((presence: any) => presence.user as User)

      // Update connected users
      console.log('[Collaboration] Presence sync - updating users from:', connectedUsers, 'to:', users)
      connectedUsers = users
    })
    .on('presence', { event: 'join' }, ({ newPresences }: { key: string, newPresences: any[] }) => {
      // Add new users to connected users
      const newUsers = newPresences.map((p: any) => p.user as User)
      const currentUserIds = connectedUsers.map(u => u.id)

      console.log('[Collaboration] Presence join - new users:', newUsers)

      newUsers.forEach((user) => {
        if (!currentUserIds.includes(user.id)) {
          connectedUsers.push(user)
          console.log('[Collaboration] Added user:', user, 'total users:', connectedUsers.length)
        }
      })
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }: { key: string, leftPresences: any[] }) => {
      // Remove users who left
      const leftUserIds = leftPresences.map((p: any) => p.user.id)
      console.log('[Collaboration] Presence leave - leaving users:', leftPresences.map(p => p.user))
      connectedUsers = connectedUsers.filter(user => !leftUserIds.includes(user.id))
      console.log('[Collaboration] After remove, remaining users:', connectedUsers)
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

  // Subscribe to channel for messages (article updates, etc.)
  const messageChannel = supabase.channel(`magazine-${shareId}`)

  messageChannel
    .on('broadcast', { event: '*' }, ({ event, payload }) => {
      handleMessage({ event, data: payload })
    })
    .subscribe()

  unsubscribeFunction = () => {
    messageChannel.unsubscribe()

    if (presenceChannel) {
      presenceChannel.untrack()
      presenceChannel.unsubscribe()
    }
  }

  return unsubscribeFunction
}

export async function leaveSession() {
  if (currentShareId && unsubscribeFunction) {
    // Untrack presence
    if (presenceChannel) {
      presenceChannel.untrack()
      presenceChannel.unsubscribe()
      presenceChannel = null
    }

    // Cleanup message channel
    unsubscribeFunction()
    unsubscribeFunction = null
    currentShareId = null
    connectedUsers = [{ id: userId, animal: userAnimal }]
  }
}

function handleMessage(payload: MessagePayload) {
  const { event, data } = payload

  switch (event) {
    case 'state:update':
      handleStateUpdate(data as { allowEdit: boolean })
      break
    case 'article:reorder':
      handleArticleReorder(data as { articles: any[], user: User })
      break
    case 'article:update':
      handleArticleUpdate(data as { article: any, user: User })
      break
    case 'article:delete':
      handleArticleDelete(data as { articleId: string, user: User })
      break
    default:
      console.log('Unknown event:', event)
  }
}

// Update edit status without leaving the session
export function updateEditStatus(allowEdit: boolean) {
  isEditAllowed = allowEdit

  // Update the store and broadcast the change
  updateShareStatus(allowEdit)
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

    // Broadcast the state update to all users
    broadcastStateUpdate(allowEdit)
  }
}

// Handle state updates from the channel
function handleStateUpdate(data: { allowEdit: boolean }) {
  // Store the data to be used later
  const pendingUpdate = {
    allowEdit: data.allowEdit,
  }

  // Update local edit allowed status
  isEditAllowed = data.allowEdit

  console.log('Received state update:', pendingUpdate)

  // Try to update the store directly if it's available
  const magazineStore = getMagazineStore()
  if (magazineStore) {
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit: pendingUpdate.allowEdit,
      shareId: currentShareId,
    })
  }
  else {
    // Log for debugging if store isn't available
    console.log('Store not available for update')
  }
}

// Handlers for article operations
function handleArticleReorder(data: { articles: any[], user: User }) {
  if (!isEditAllowed)
    return

  const magazineStore = getMagazineStore()
  if (magazineStore) {
    // Prevent triggering another broadcast by setting a flag
    magazineStore.reorderArticles(data.articles, data.user, false)
  }
}

function handleArticleUpdate(data: { article: any, user: User }) {
  if (!isEditAllowed)
    return

  const magazineStore = getMagazineStore()
  if (magazineStore) {
    magazineStore.updateArticle(data.article, {}, data.user, false)
  }
}

function handleArticleDelete(data: { articleId: string, user: User }) {
  if (!isEditAllowed)
    return

  const magazineStore = getMagazineStore()
  if (magazineStore) {
    magazineStore.deleteArticle(data.articleId, data.user, false)
  }
}

// Functions to broadcast changes to other users
export function broadcastArticleReorder(articles: any[]) {
  if (!currentShareId)
    return

  const channel = supabase.channel(`magazine-${currentShareId}`)
  channel.send({
    type: 'broadcast',
    event: 'article:reorder',
    payload: {
      articles,
      user: { id: userId, animal: userAnimal },
      timestamp: Date.now(),
    },
  })
}

export function broadcastArticleUpdate(article: any) {
  if (!currentShareId)
    return

  const channel = supabase.channel(`magazine-${currentShareId}`)
  channel.send({
    type: 'broadcast',
    event: 'article:update',
    payload: {
      article,
      user: { id: userId, animal: userAnimal },
      timestamp: Date.now(),
    },
  })
}

export function broadcastArticleDelete(articleId: string) {
  if (!currentShareId)
    return

  const channel = supabase.channel(`magazine-${currentShareId}`)
  channel.send({
    type: 'broadcast',
    event: 'article:delete',
    payload: {
      articleId,
      user: { id: userId, animal: userAnimal },
      timestamp: Date.now(),
    },
  })
}

// Function to broadcast state updates (like edit permissions)
export function broadcastStateUpdate(allowEdit: boolean) {
  if (!currentShareId)
    return

  const channel = supabase.channel(`magazine-${currentShareId}`)
  channel.send({
    type: 'broadcast',
    event: 'state:update',
    payload: {
      allowEdit,
      timestamp: Date.now(),
    },
  })
}

export const getSessionId = () => userId
export const getSessionUser = () => ({ id: userId, animal: userAnimal })
export const isCollaborating = () => !!currentShareId
export const getConnectedPeers = () => connectedUsers.length - 1
export function getConnectedUsers() {
  console.log('[Collaboration] getConnectedUsers called, returning:', connectedUsers)
  return [...connectedUsers] // Return a copy to prevent mutations
}
export const isEditingAllowed = () => isEditAllowed
