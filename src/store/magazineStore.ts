import type { Tag } from '../types'
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
}

export interface Visual {
  id: string
  type: 'image' | 'video'
  url: string
  caption: string
  width: number
  height: number
  position: {
    x: number
    y: number
    page: number
  }
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

  function addArticle(article: Partial<Article>) {
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
    }

    // Ensure articles.value is initialized
    if (!articles.value) {
      articles.value = []
    }

    articles.value.push(newArticle)
    addToHistory(`Added article: ${newArticle.title}`)
    return newArticle
  }

  function updateArticle(articleOrId: string | Article, updates?: Partial<Article>, user?: User, shouldBroadcast = true) {
    const articleId = typeof articleOrId === 'string' ? articleOrId : articleOrId.id
    const articleIndex = articles.value.findIndex(a => a.id === articleId)

    if (articleIndex === -1)
      return

    const article = articles.value[articleIndex]

    if (typeof articleOrId === 'object' && !updates) {
      // Replace entirely
      articles.value[articleIndex] = articleOrId
      addToHistory(`Updated article ${article.title}`, user)
    }
    else if (updates) {
      // Update specific fields
      articles.value[articleIndex] = { ...article, ...updates }
      addToHistory(`Updated article ${article.title}`, user)
    }

    // Broadcast changes to other users if we're in a shared session
    if (isShared.value && shouldBroadcast) {
      broadcastArticleUpdate(articles.value[articleIndex])
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
  }

  function removePage() {
    if (pages.value > 1) {
      pages.value -= 1
      addToHistory(`Removed page: ${pages.value + 1}`)
    }
  }

  function setPages(pageCount: number) {
    pages.value = pageCount
    addToHistory(`Set pages to ${pageCount}`)
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

  function undo() {
    if (history.past.length > 0) {
      const previous = history.past.pop()
      if (previous) {
        const current = { articles: [...articles.value], description: 'Current state' }
        history.future.push(current)
        articles.value = [...previous.articles]
      }
    }
  }

  function redo() {
    if (history.future.length > 0) {
      const next = history.future.pop()
      if (next) {
        const current = { articles: [...articles.value], description: 'Current state' }
        history.past.push(current)
        articles.value = [...next.articles]
      }
    }
  }

  function jumpToHistory(index: number) {
    if (index >= 0 && index < history.past.length) {
      const targetState = history.past[index]
      const currentState = { articles: [...articles.value], description: 'Current state' }

      // Move all states after the target to future
      const newFuture = history.past.slice(index + 1).reverse()
      newFuture.push(currentState)

      // Set past to include only states up to the target
      history.past = history.past.slice(0, index)

      // Update future and current state
      history.future = [...newFuture, ...history.future]
      articles.value = [...targetState.articles]
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
