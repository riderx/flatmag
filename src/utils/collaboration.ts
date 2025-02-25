import { getMagazineStore } from '../store/mainStore'
import { getRandomAnimal } from './animals'
import { broadcastToChannel, subscribeToChannel } from './supabase'

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

let userId = Math.random().toString(36).substr(2, 9)
let userAnimal = getRandomAnimal()
let connectedUsers: User[] = [{ id: userId, animal: userAnimal }]
let currentShareId: string | null = null
let unsubscribeFunction: (() => void) | null = null
let isEditAllowed = true

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

  currentShareId = shareId
  isEditAllowed = allowEdit
  initializeCollaboration()

  // Subscribe to channel
  unsubscribeFunction = subscribeToChannel(shareId, (payload) => {
    handleMessage(payload)
  })

  // Broadcast join event
  broadcastToChannel(shareId, 'user:join', {
    user: {
      id: userId,
      animal: userAnimal,
    },
    timestamp: Date.now(),
  })

  return () => {
    if (unsubscribeFunction) {
      unsubscribeFunction()
      unsubscribeFunction = null
    }
  }
}

export async function leaveSession() {
  if (currentShareId && unsubscribeFunction) {
    // Broadcast leave event
    broadcastToChannel(currentShareId, 'user:leave', {
      userId,
      timestamp: Date.now(),
    })

    // Cleanup
    unsubscribeFunction()
    unsubscribeFunction = null
    currentShareId = null
    connectedUsers = [{ id: userId, animal: userAnimal }]
  }
}

function handleMessage(payload: MessagePayload) {
  const { event, data } = payload

  switch (event) {
    case 'user:join':
      handleUserJoin(data as { user: User })
      break
    case 'user:leave':
      handleUserLeave(data as { userId: string })
      break
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

function handleUserJoin(data: { user: User }) {
  const { user } = data
  if (!connectedUsers.some(u => u.id === user.id)) {
    connectedUsers.push(user)
  }
}

function handleUserLeave(data: { userId: string }) {
  const { userId: leavingUserId } = data
  connectedUsers = connectedUsers.filter(user => user.id !== leavingUserId)
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
  }
}

// Handle state updates from the channel
function handleStateUpdate(data: { allowEdit: boolean }) {
  // Store the data to be used later
  const pendingUpdate = {
    allowEdit: data.allowEdit,
  }

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
    console.log('Received state update:', pendingUpdate)
  }
}

// New handlers for article operations
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

  broadcastToChannel(currentShareId, 'article:reorder', {
    articles,
    user: { id: userId, animal: userAnimal },
    timestamp: Date.now(),
  })
}

export function broadcastArticleUpdate(article: any) {
  if (!currentShareId)
    return

  broadcastToChannel(currentShareId, 'article:update', {
    article,
    user: { id: userId, animal: userAnimal },
    timestamp: Date.now(),
  })
}

export function broadcastArticleDelete(articleId: string) {
  if (!currentShareId)
    return

  broadcastToChannel(currentShareId, 'article:delete', {
    articleId,
    user: { id: userId, animal: userAnimal },
    timestamp: Date.now(),
  })
}

export const getSessionId = () => userId
export const getSessionUser = () => ({ id: userId, animal: userAnimal })
export const isCollaborating = () => !!currentShareId
export const getConnectedPeers = () => connectedUsers.length - 1
export const getConnectedUsers = () => connectedUsers
export const isEditingAllowed = () => isEditAllowed
