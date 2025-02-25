import type { Article, MagazineState } from '../store/magazineStore'
import LZString from 'lz-string'
import { initializeCollaboration } from './collaboration'
import { broadcastToChannel, createShare, getShare, subscribeToChannel } from './supabase'

export type SharePermission = 'read' | 'edit'

interface ShareData {
  shareId: string | null
  permission: SharePermission | null
}

export function loadSharedState(): ShareData {
  try {
    const shareData = localStorage.getItem('shareData')
    if (!shareData)
      return { shareId: null, permission: null }

    const { shareId, permission } = JSON.parse(shareData)
    return { shareId, permission }
  }
  catch (error) {
    console.error('Error loading shared state:', error)
    return { shareId: null, permission: null }
  }
}

export function generateShareUrl(allowEdit: boolean, magazineStore: {
  articles: Article[]
  zoomLevel: string
  showList: boolean
  title: string
  issueNumber: number
  publicationDate: string
  pageRatio: string
}) {
  // Create a compressed state object from the stores
  const stateToShare = {
    magazine: {
      articles: magazineStore.articles,
      zoomLevel: magazineStore.zoomLevel,
      showList: magazineStore.showList,
      title: magazineStore.title,
      issueNumber: magazineStore.issueNumber,
      publicationDate: magazineStore.publicationDate,
      pageRatio: magazineStore.pageRatio,
    },
  }

  // Compress the state
  const compressedState = LZString.compressToEncodedURIComponent(
    JSON.stringify(stateToShare),
  )

  // Create the URL with the compressed state and edit permission
  const baseUrl = window.location.origin
  return `${baseUrl}/share?data=${compressedState}&edit=${allowEdit ? '1' : '0'}`
}

export async function initializeShare(allowEdit: boolean, magazineStore: { $state: MagazineState }) {
  try {
    // Initialize collaboration system
    initializeCollaboration()

    // Get current state
    const stateToShare = {
      magazine: magazineStore.$state,
    }

    // Create share
    const shareId = await createShare(JSON.stringify(stateToShare))

    // Subscribe to channel immediately
    subscribeToChannel(shareId, (payload) => {
      console.log('Received broadcast:', payload)
    })

    // Store share info in localStorage
    localStorage.setItem('shareData', JSON.stringify({
      shareId,
      permission: allowEdit ? 'edit' : 'read',
    }))

    // Broadcast initial connection
    broadcastToChannel(shareId, 'user:join', {
      timestamp: Date.now(),
    })

    return shareId
  }
  catch (error) {
    console.error('Share initialization error:', error)
    throw error
  }
}

export async function getSharedState(shareId: string) {
  try {
    const sharedData = await getShare(shareId)
    return sharedData ? JSON.parse(sharedData) : null
  }
  catch (error) {
    console.error('Error fetching shared state:', error)
    return null
  }
}
