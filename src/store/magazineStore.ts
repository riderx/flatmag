import type { Tag, Visual } from '../types'
import type { User } from '../utils/collaboration'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, reactive, ref, watch } from 'vue'
import {
  broadcastArticleDelete,
  broadcastArticleReorder,
  broadcastArticleUpdate,
  getSessionUser,

} from '../utils/collaboration'
import { useTagStore } from './tagStore'

export interface Article {
  id: string
  title: string
  content: string
  visuals: Visual[]
  tags: string[]
  wordCount: number
  pageCount: number
  columns: 1 | 2 | 3
  startPage: number
  wordsPerPage: number
  lineHeight: string
  isLocked: boolean
  pages: any[]
}

export interface PageMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface HistoryEntry {
  articles: Article[]
  description: string
  user?: User
  pages?: number
  pageMargins?: Record<number, PageMargin>
  zoomLevel?: string
  title?: string
  issueNumber?: number
  publicationDate?: string
  pageRatio?: string
}

export interface MagazineState {
  articles: Article[]
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
  }
  pages: number
  pageMargins: Record<number, PageMargin>
  zoomLevel: string
  showList: boolean
  isShared: boolean
  allowEdit: boolean
  isConnecting: boolean
  shareId: string | null
  title: string
  issueNumber: number
  publicationDate: string
  pageRatio: string
  magazineTags: Tag[]
}

export const useMagazineStore = defineStore('magazine', () => {
  const tagStore = useTagStore()

  const articles = ref<Article[]>([])
  const history = reactive({
    past: [] as HistoryEntry[],
    future: [] as HistoryEntry[],
  })
  const pages = ref(4)
  const pageMargins = ref<Record<number, PageMargin>>({})
  const zoomLevel = ref('2')
  const showList = ref(true)
  const isShared = ref(false)
  const allowEdit = ref(true)
  const isConnecting = ref(false)
  const shareId = ref<string | null>(null)
  const title = ref('My Magazine')
  const issueNumber = ref(1)
  const publicationDate = ref(new Date().toISOString())
  const pageRatio = ref('1/1.4142')
  const magazineTags = ref<Tag[]>([])

  // Function to add current state to history
  function addToHistory(description: string, user?: User) {
    history.past.push({
      articles: JSON.parse(JSON.stringify(articles.value)),
      description,
      user: user || getSessionUser(),
      pages: pages.value,
      pageMargins: JSON.parse(JSON.stringify(pageMargins.value)),
      zoomLevel: zoomLevel.value,
      title: title.value,
      issueNumber: issueNumber.value,
      publicationDate: publicationDate.value,
      pageRatio: pageRatio.value,
    })
    history.future = []
  }

  // Function to save current state to localStorage
  function saveToLocalStorage() {
    try {
      // Get current magazine ID from URL
      const currentPath = window.location.pathname
      const magazineId = currentPath.split('/flat-plan/')[1]

      if (!magazineId)
        return

      // Load and update magazines list
      const magazines = JSON.parse(localStorage.getItem('magazines') || '[]')
      const magazineIndex = magazines.findIndex((m: any) => m.id === magazineId)

      if (magazineIndex !== -1) {
        // Update magazine with current state including magazineTags
        magazines[magazineIndex] = {
          ...magazines[magazineIndex],
          title: title.value,
          issue_number: issueNumber.value,
          publication_date: publicationDate.value,
          page_ratio: pageRatio.value,
          state: {
            articles: articles.value,
            history,
            pages: pages.value,
            pageMargins: pageMargins.value,
            zoomLevel: zoomLevel.value,
            showList: showList.value,
            isShared: isShared.value,
            allowEdit: allowEdit.value,
            isConnecting: isConnecting.value,
            shareId: shareId.value,
            title: title.value,
            issueNumber: issueNumber.value,
            publicationDate: publicationDate.value,
            pageRatio: pageRatio.value,
            magazineTags: magazineTags.value,
          },
        }

        // Save updated magazines list
        localStorage.setItem('magazines', JSON.stringify(magazines))
      }
    }
    catch (err) {
      console.error('Error saving state:', err)
    }
  }

  // Watch for changes to all reactive state and save to localStorage
  watch(
    [
      articles,
      () => history.past,
      () => history.future,
      pages,
      pageMargins,
      zoomLevel,
      showList,
      isShared,
      allowEdit,
      isConnecting,
      shareId,
      title,
      issueNumber,
      publicationDate,
      pageRatio,
    ],
    () => {
      saveToLocalStorage()
    },
    { deep: true },
  )

  function addArticle(article: Partial<Article>, user?: User, shouldBroadcast = true) {
    const newArticle: Article = {
      id: article.id || uuidv4(),
      title: article.title || 'New Article',
      content: article.content || '',
      visuals: article.visuals || [],
      tags: article.tags || [],
      wordCount: article.wordCount || 0,
      pageCount: article.pageCount || 1,
      columns: article.columns || 1,
      startPage: article.startPage || 1,
      wordsPerPage: article.wordsPerPage || 500,
      lineHeight: article.lineHeight || '1/100',
      isLocked: article.isLocked || false,
      pages: article.pages || [],
    }

    // Ensure articles.value is initialized
    if (!articles.value) {
      articles.value = []
    }

    articles.value.push(newArticle)
    addToHistory(`Added article: ${newArticle.title}`, user)

    // Broadcast new article to other users if we're in a shared session
    if (isShared.value && shouldBroadcast && !(article as any)?._remoteSync) {
      console.log('[MagazineStore] Broadcasting new article:', newArticle.id)

      // Import the broadcast function dynamically
      import('../utils/collaboration').then(({ broadcastArticleAdd }) => {
        broadcastArticleAdd(newArticle)
      })
    }

    return newArticle
  }

  function updateArticle(articleOrId: string | Article, updates?: Partial<Article>, user?: User, shouldBroadcast = true) {
    const articleId = typeof articleOrId === 'string' ? articleOrId : articleOrId.id
    const articleIndex = articles.value.findIndex(a => a.id === articleId)

    if (articleIndex === -1) {
      console.warn('[MagazineStore] Cannot update article, not found:', articleId)
      return
    }

    const article = articles.value[articleIndex]
    let updatedArticle: Article

    // Check if this is a remote sync update with the full article
    const isRemoteSync = typeof articleOrId === 'object' && (articleOrId as any)._remoteSync === true

    if (typeof articleOrId === 'object' && !updates) {
      // Replace entirely - create a deep copy to ensure reactivity
      updatedArticle = JSON.parse(JSON.stringify(articleOrId))

      // When receiving a remote update, ensure we preserve local properties that shouldn't be overwritten
      if (isRemoteSync) {
        console.log('[MagazineStore] Applying remote article update:', updatedArticle.id)

        // Force Vue to detect the change by using the array splice method
        // This ensures the reactive system recognizes the update
        articles.value.splice(articleIndex, 1, updatedArticle)
      }
      else {
        articles.value[articleIndex] = updatedArticle
      }

      addToHistory(`Updated article ${article.title}`, user)
    }
    else if (updates) {
      // Update specific fields
      updatedArticle = { ...article, ...updates }

      // Force Vue to detect the change for partial updates too
      articles.value.splice(articleIndex, 1, updatedArticle)
      addToHistory(`Updated article ${article.title}`, user)
    }
    else {
      updatedArticle = article
    }

    // Check for forced update via timestamp properties
    const hasForceUpdate = (updatedArticle as any)._lastUpdated !== undefined
      || (updatedArticle as any)._syncTimestamp !== undefined
      || (updatedArticle as any)._remoteSync === true

    // Enhanced detection of visual position changes
    const originalVisuals = article.visuals || []
    const updatedVisuals = updatedArticle.visuals || []

    // Check position changes with a smaller threshold for better detection
    const visualPositionsChanged = updatedVisuals.some((updatedVisual) => {
      const originalVisual = originalVisuals.find(v => v.id === updatedVisual.id)
      return originalVisual && (
        Math.abs(originalVisual.x - updatedVisual.x) > 0.001 // Smaller threshold for more sensitive detection
        || Math.abs(originalVisual.y - updatedVisual.y) > 0.001
        || originalVisual.page !== updatedVisual.page
      )
    })

    // Check if any visuals were added or removed
    const visualsAddedOrRemoved = originalVisuals.length !== updatedVisuals.length

    // Check if pages were updated
    const pagesUpdated = JSON.stringify(article.pages) !== JSON.stringify(updatedArticle.pages)

    // Check if critical metadata was updated
    const titleChanged = article.title !== updatedArticle.title
    const tagsChanged = JSON.stringify(article.tags) !== JSON.stringify(updatedArticle.tags)
    const wordCountChanged = article.wordCount !== updatedArticle.wordCount
    const pageCountChanged = article.pageCount !== updatedArticle.pageCount
    const columnsChanged = article.columns !== updatedArticle.columns

    // Metadata changes should trigger broadcasts as well
    const metadataChanged = titleChanged || tagsChanged || wordCountChanged
      || pageCountChanged || columnsChanged

    // Log position changes for debugging
    if (visualPositionsChanged) {
      console.log('[MagazineStore] Visual positions changed:', {
        articleId: updatedArticle.id,
        visualsChanged: updatedVisuals.filter((updatedVisual) => {
          const originalVisual = originalVisuals.find(v => v.id === updatedVisual.id)
          return originalVisual && (
            Math.abs(originalVisual.x - updatedVisual.x) > 0.001
            || Math.abs(originalVisual.y - updatedVisual.y) > 0.001
            || originalVisual.page !== updatedVisual.page
          )
        }).map(v => ({
          id: v.id,
          oldX: originalVisuals.find(ov => ov.id === v.id)?.x,
          newX: v.x,
          oldY: originalVisuals.find(ov => ov.id === v.id)?.y,
          newY: v.y,
        })),
      })
    }

    if (metadataChanged) {
      console.log('[MagazineStore] Article metadata changed:', {
        articleId: updatedArticle.id,
        titleChanged,
        tagsChanged,
        wordCountChanged,
        pageCountChanged,
        columnsChanged,
      })
    }

    // Skip broadcasting if:
    // - This is a remote sync update (to avoid loops)
    // - Broadcasting is explicitly disabled
    const skipBroadcast = isRemoteSync || !shouldBroadcast

    // Always broadcast if:
    // - visual positions changed
    // - visuals were added/removed
    // - pages were updated
    // - a force update is requested
    // - metadata like title changed
    // - explicit broadcast is requested
    const shouldSendBroadcast = isShared.value && !skipBroadcast && (
      visualPositionsChanged
      || visualsAddedOrRemoved
      || pagesUpdated
      || metadataChanged
      || hasForceUpdate
    )

    if (shouldSendBroadcast) {
      console.log('[MagazineStore] Broadcasting article update:', {
        articleId: updatedArticle.id,
        visualPositionsChanged,
        visualsAddedOrRemoved,
        pagesUpdated,
        metadataChanged,
        shouldBroadcast,
        hasForceUpdate,
        isRemoteSync,
      })

      // Create a clean copy for broadcasting
      const cleanedArticle = JSON.parse(JSON.stringify(articles.value[articleIndex]))

      // Remove temporary properties used for update detection
      if ('_lastUpdated' in cleanedArticle) {
        delete (cleanedArticle as any)._lastUpdated
      }
      if ('_syncTimestamp' in cleanedArticle) {
        delete (cleanedArticle as any)._syncTimestamp
      }
      if ('_remoteSync' in cleanedArticle) {
        delete (cleanedArticle as any)._remoteSync
      }

      // Add broadcast timestamp to force update recognition
      const broadcastArticle = {
        ...cleanedArticle,
        _broadcastTimestamp: Date.now(),
      }

      // Send the update to other users
      broadcastArticleUpdate(broadcastArticle)
    }
    else if (isRemoteSync) {
      console.log('[MagazineStore] Not broadcasting remote update to avoid loops')
    }
  }

  function removeArticle(id: string) {
    const index = articles.value.findIndex(article => article.id === id)
    if (index !== -1) {
      const article = articles.value[index]
      articles.value.splice(index, 1)
      addToHistory(`Removed article: ${article.title}`)
    }
  }

  function deleteArticle(id: string, user?: User, shouldBroadcast = true) {
    const articleIndex = articles.value.findIndex(a => a.id === id)
    if (articleIndex === -1)
      return

    const article = articles.value[articleIndex]
    articles.value.splice(articleIndex, 1)
    addToHistory(`Deleted article ${article.title}`, user)

    // Broadcast delete to other users if we're in a shared session
    if (isShared.value && shouldBroadcast) {
      broadcastArticleDelete(id)
    }
  }

  function addPage() {
    pages.value += 1
    addToHistory(`Added page: ${pages.value}`)

    // Broadcast the updated page count to other users
    if (isShared.value) {
      syncMagazineSettings({ pages: pages.value }, true)
    }
  }

  function removePage() {
    if (pages.value > 1) {
      pages.value -= 1
      addToHistory(`Removed page: ${pages.value + 1}`)

      // Broadcast the updated page count to other users
      if (isShared.value) {
        syncMagazineSettings({ pages: pages.value }, true)
      }
    }
  }

  function setPages(pageCount: number) {
    pages.value = pageCount
    addToHistory(`Set pages to ${pageCount}`)

    // Broadcast the updated page count to other users
    if (isShared.value) {
      syncMagazineSettings({ pages: pages.value }, true)
    }
  }

  function setZoomLevel(level: string) {
    zoomLevel.value = level
    addToHistory(`Set zoom level to ${level}`)
  }

  function toggleList() {
    showList.value = !showList.value
    addToHistory(`${showList.value ? 'Showed' : 'Hid'} article list`)
  }

  function setShowList(show: boolean) {
    showList.value = show
    addToHistory(`${show ? 'Showed' : 'Hid'} article list`)
  }

  function setShareStatus(status: { isShared: boolean, allowEdit: boolean, shareId: string | null }) {
    isShared.value = status.isShared
    allowEdit.value = status.allowEdit
    shareId.value = status.shareId
    addToHistory(`${status.isShared ? 'Enabled' : 'Disabled'} sharing`)
  }

  function setConnecting(connecting: boolean) {
    isConnecting.value = connecting
  }

  function setConnectionStatus(connecting: boolean) {
    isConnecting.value = connecting
  }

  function updatePageMargin(pageNumber: number, margin: PageMargin) {
    pageMargins.value[pageNumber] = margin
    addToHistory(`Updated margins for page ${pageNumber}`)
  }

  function reorderArticles(newArticles: Article[], user?: User, shouldBroadcast = true) {
    articles.value = [...newArticles]
    addToHistory('Reordered articles', user)

    // Broadcast reorder to other users if we're in a shared session
    if (isShared.value && shouldBroadcast) {
      broadcastArticleReorder(newArticles)
    }
  }

  function syncState(data: { magazine: MagazineState }) {
    const { magazine } = data

    // Initialize articles array if it doesn't exist
    if (!articles.value) {
      articles.value = []
    }

    if (magazine.articles) {
      articles.value = magazine.articles
    }

    if (magazine.history) {
      history.past = magazine.history.past || []
      history.future = magazine.history.future || []
    }

    if (magazine.pages) {
      pages.value = magazine.pages
    }

    if (magazine.pageMargins) {
      pageMargins.value = magazine.pageMargins
    }

    if (magazine.zoomLevel) {
      zoomLevel.value = magazine.zoomLevel
    }

    if (magazine.showList !== undefined) {
      showList.value = magazine.showList
    }

    if (magazine.isShared !== undefined) {
      isShared.value = magazine.isShared
    }

    if (magazine.allowEdit !== undefined) {
      allowEdit.value = magazine.allowEdit
    }

    if (magazine.isConnecting !== undefined) {
      isConnecting.value = magazine.isConnecting
    }

    if (magazine.shareId !== undefined) {
      shareId.value = magazine.shareId
    }

    // Always set these values if they exist in the magazine data
    if (magazine.title) {
      title.value = magazine.title
    }

    if (magazine.issueNumber !== undefined) {
      issueNumber.value = magazine.issueNumber
    }

    if (magazine.publicationDate) {
      publicationDate.value = magazine.publicationDate
    }

    if (magazine.pageRatio) {
      pageRatio.value = magazine.pageRatio
    }

    if (magazine.magazineTags) {
      magazineTags.value = magazine.magazineTags
    }
  }

  // New function to sync magazine settings (title, issueNumber, etc.)
  function syncMagazineSettings(settings: any, shouldBroadcast = true) {
    console.log('[MagazineStore] Syncing magazine settings:', {
      pages: settings.pages,
      title: settings.title,
      historyOp: settings._historyOperation || 'direct update',
      prevPages: pages.value,
      hasTimestamp: !!settings._broadcast_timestamp,
    })

    const isHistoryOperation = settings._historyOperation === 'undo'
      || settings._historyOperation === 'redo'
      || settings._historyOperation === 'jump'

    // Update all relevant settings that are provided
    if (settings.title !== undefined) {
      console.log('[MagazineStore] Updating title:', settings.title)
      title.value = settings.title
    }

    if (settings.issueNumber !== undefined) {
      issueNumber.value = Number(settings.issueNumber)
    }

    if (settings.publicationDate !== undefined) {
      publicationDate.value = settings.publicationDate
    }

    if (settings.pageRatio !== undefined) {
      pageRatio.value = settings.pageRatio
    }

    if (settings.pages !== undefined) {
      const oldPages = pages.value
      pages.value = Number(settings.pages)
      console.log(`[MagazineStore] ${isHistoryOperation ? 'HISTORY' : 'DIRECT'} Page count update:`, {
        oldPages,
        newPages: pages.value,
        fromSettings: settings.pages,
        historyOp: settings._historyOperation || 'none',
      })
    }

    if (settings.zoomLevel !== undefined) {
      zoomLevel.value = settings.zoomLevel
    }

    // Handle magazine-specific tags
    if (settings.magazineTags !== undefined) {
      // Use splice to replace the entire array to ensure reactivity
      const newTags = [...settings.magazineTags]
      magazineTags.value = newTags
    }

    // Force reactivity by adding a timestamp property
    const timestamp = Date.now()
    const reactivityMarker = `_syncTimestamp_${timestamp}`
    // @ts-expect-error Adding temporary property for reactivity
    magazineTags.value[reactivityMarker] = timestamp
    setTimeout(() => {
      // @ts-expect-error Removing temporary property
      delete magazineTags.value[reactivityMarker]
    }, 100)

    // Only add to history if this is not from a history operation itself
    if (!isHistoryOperation) {
      addToHistory('Updated magazine settings')
    }

    saveToLocalStorage()

    // Import the broadcast function only if we need it
    if (shouldBroadcast && isShared.value) {
      import('../utils/collaboration').then(({ broadcastMagazineSettings }) => {
        // Get current settings to broadcast
        const currentSettings = {
          title: title.value,
          issueNumber: issueNumber.value,
          publicationDate: publicationDate.value,
          pageRatio: pageRatio.value,
          pages: pages.value,
          zoomLevel: zoomLevel.value,
          magazineTags: magazineTags.value,
        }

        broadcastMagazineSettings(currentSettings)
      })
    }
  }

  function undo() {
    if (history.past.length > 0) {
      const previous = history.past.pop()
      if (previous) {
        const current = {
          articles: [...articles.value],
          description: 'Current state',
          pages: pages.value,
          pageMargins: JSON.parse(JSON.stringify(pageMargins.value)),
          zoomLevel: zoomLevel.value,
          title: title.value,
          issueNumber: issueNumber.value,
          publicationDate: publicationDate.value,
          pageRatio: pageRatio.value,
        }
        history.future.push(current)
        articles.value = [...previous.articles]

        // Also restore other magazine settings if available
        if (previous.pages !== undefined)
          pages.value = previous.pages
        if (previous.pageMargins)
          pageMargins.value = previous.pageMargins
        if (previous.zoomLevel)
          zoomLevel.value = previous.zoomLevel
        if (previous.title)
          title.value = previous.title
        if (previous.issueNumber)
          issueNumber.value = previous.issueNumber
        if (previous.publicationDate)
          publicationDate.value = previous.publicationDate
        if (previous.pageRatio)
          pageRatio.value = previous.pageRatio

        // Broadcast the changes to other users
        if (isShared.value) {
          console.log('[MagazineStore] Broadcasting undo operation')

          // Add timestamp to all articles to ensure they're recognized as updated
          const articlesWithTimestamp = articles.value.map(article => ({
            ...article,
            _lastUpdated: Date.now(),
            _broadcastTimestamp: Date.now(),
            _undoOperation: true,
          }))

          // Broadcast the article updates
          import('../utils/collaboration').then(({ broadcastArticleReorder, broadcastMagazineSettings }) => {
            broadcastArticleReorder(articlesWithTimestamp)

            // Also broadcast page count and other magazine settings
            const currentSettings = {
              title: title.value,
              issueNumber: issueNumber.value,
              publicationDate: publicationDate.value,
              pageRatio: pageRatio.value,
              pages: pages.value,
              zoomLevel: zoomLevel.value,
              magazineTags: magazineTags.value,
              _historyOperation: 'undo',
            }
            broadcastMagazineSettings(currentSettings)
          })
        }
      }
    }
  }

  function redo() {
    if (history.future.length > 0) {
      const next = history.future.pop()
      if (next) {
        const current = {
          articles: [...articles.value],
          description: 'Current state',
          pages: pages.value,
          pageMargins: JSON.parse(JSON.stringify(pageMargins.value)),
          zoomLevel: zoomLevel.value,
          title: title.value,
          issueNumber: issueNumber.value,
          publicationDate: publicationDate.value,
          pageRatio: pageRatio.value,
        }
        history.past.push(current)
        articles.value = [...next.articles]

        // Also restore other magazine settings if available
        if (next.pages !== undefined)
          pages.value = next.pages
        if (next.pageMargins)
          pageMargins.value = next.pageMargins
        if (next.zoomLevel)
          zoomLevel.value = next.zoomLevel
        if (next.title)
          title.value = next.title
        if (next.issueNumber)
          issueNumber.value = next.issueNumber
        if (next.publicationDate)
          publicationDate.value = next.publicationDate
        if (next.pageRatio)
          pageRatio.value = next.pageRatio

        // Broadcast the changes to other users
        if (isShared.value) {
          console.log('[MagazineStore] Broadcasting redo operation')

          // Add timestamp to all articles to ensure they're recognized as updated
          const articlesWithTimestamp = articles.value.map(article => ({
            ...article,
            _lastUpdated: Date.now(),
            _broadcastTimestamp: Date.now(),
            _redoOperation: true,
          }))

          // Broadcast the article updates
          import('../utils/collaboration').then(({ broadcastArticleReorder, broadcastMagazineSettings }) => {
            broadcastArticleReorder(articlesWithTimestamp)

            // Also broadcast page count and other magazine settings
            const currentSettings = {
              title: title.value,
              issueNumber: issueNumber.value,
              publicationDate: publicationDate.value,
              pageRatio: pageRatio.value,
              pages: pages.value,
              zoomLevel: zoomLevel.value,
              magazineTags: magazineTags.value,
              _historyOperation: 'redo',
            }
            broadcastMagazineSettings(currentSettings)
          })
        }
      }
    }
  }

  function jumpToHistory(index: number) {
    if (index >= 0 && index < history.past.length) {
      const targetState = history.past[index]
      const currentState = {
        articles: [...articles.value],
        description: 'Current state',
        pages: pages.value,
        pageMargins: JSON.parse(JSON.stringify(pageMargins.value)),
        zoomLevel: zoomLevel.value,
        title: title.value,
        issueNumber: issueNumber.value,
        publicationDate: publicationDate.value,
        pageRatio: pageRatio.value,
      }

      // Move all states after the target to future
      const newFuture = history.past.slice(index + 1).reverse()
      newFuture.push(currentState)

      // Set past to include only states up to the target
      history.past = history.past.slice(0, index)

      // Update future and current state
      history.future = [...newFuture, ...history.future]
      articles.value = [...targetState.articles]

      // Also restore other magazine settings if available
      if (targetState.pages !== undefined)
        pages.value = targetState.pages
      if (targetState.pageMargins)
        pageMargins.value = targetState.pageMargins
      if (targetState.zoomLevel)
        zoomLevel.value = targetState.zoomLevel
      if (targetState.title)
        title.value = targetState.title
      if (targetState.issueNumber)
        issueNumber.value = targetState.issueNumber
      if (targetState.publicationDate)
        publicationDate.value = targetState.publicationDate
      if (targetState.pageRatio)
        pageRatio.value = targetState.pageRatio

      // Broadcast the changes to other users
      if (isShared.value) {
        console.log('[MagazineStore] Broadcasting history restoration:', { historyIndex: index })

        // Add timestamp to all articles to ensure they're recognized as updated
        const articlesWithTimestamp = articles.value.map(article => ({
          ...article,
          _lastUpdated: Date.now(),
          _broadcastTimestamp: Date.now(),
          _historyRestoration: true,
        }))

        // Broadcast article updates
        import('../utils/collaboration').then(({ broadcastArticleReorder, broadcastMagazineSettings }) => {
          broadcastArticleReorder(articlesWithTimestamp)

          // Also broadcast page count and other magazine settings
          const currentSettings = {
            title: title.value,
            issueNumber: issueNumber.value,
            publicationDate: publicationDate.value,
            pageRatio: pageRatio.value,
            pages: pages.value,
            zoomLevel: zoomLevel.value,
            magazineTags: magazineTags.value,
            _historyOperation: 'jump',
            _historyIndex: index,
          }
          broadcastMagazineSettings(currentSettings)
        })
      }
    }
  }

  function resetState() {
    articles.value = []
    history.past = []
    history.future = []
    pages.value = 4
    pageMargins.value = {}
    zoomLevel.value = '2'
    showList.value = true
    isShared.value = false
    allowEdit.value = true
    isConnecting.value = false
    shareId.value = null
    title.value = 'My Magazine'
    issueNumber.value = 1
    publicationDate.value = new Date().toISOString()
    pageRatio.value = '1/1.4142'
    magazineTags.value = []
  }

  // Add functions for managing magazine-specific tags
  function addMagazineTag(tag: Tag) {
    magazineTags.value.push(tag)
    saveToLocalStorage()
  }

  function updateMagazineTag(updatedTag: Tag) {
    const index = magazineTags.value.findIndex(tag => tag.id === updatedTag.id)
    if (index !== -1) {
      magazineTags.value[index] = updatedTag
      saveToLocalStorage()
    }
  }

  function deleteMagazineTag(id: string) {
    magazineTags.value = magazineTags.value.filter(tag => tag.id !== id)
    saveToLocalStorage()
  }

  // Function to get all available tags (global + magazine-specific)
  const getAllTags = computed(() => {
    // Combine global tags and magazine-specific tags
    // Use a Map to handle duplicates (preferring magazine-specific tags)
    const tagsMap = new Map()

    // Add global tags first
    tagStore.tags.forEach((tag) => {
      tagsMap.set(tag.id, tag)
    })

    // Then add magazine-specific tags (will override global tags with same id)
    magazineTags.value.forEach((tag) => {
      tagsMap.set(tag.id, tag)
    })

    return Array.from(tagsMap.values())
  })

  return {
    // State
    articles,
    history,
    pages,
    pageMargins,
    zoomLevel,
    showList,
    isShared,
    allowEdit,
    isConnecting,
    shareId,
    title,
    issueNumber,
    publicationDate,
    pageRatio,
    magazineTags,
    getAllTags,

    // Actions
    addArticle,
    updateArticle,
    removeArticle,
    deleteArticle,
    addPage,
    removePage,
    setPages,
    setZoomLevel,
    toggleList,
    setShowList,
    setShareStatus,
    setConnecting,
    setConnectionStatus,
    updatePageMargin,
    reorderArticles,
    syncState,
    syncMagazineSettings,
    undo,
    redo,
    jumpToHistory,
    resetState,
    saveToLocalStorage,
    addMagazineTag,
    updateMagazineTag,
    deleteMagazineTag,
  }
})
