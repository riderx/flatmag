<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleForm from '../components/ArticleForm/ArticleForm.vue'
import CollaborationStatus from '../components/CollaborationStatus.vue'
import CursorOverlay from '../components/CursorOverlay.vue'
import DeleteConfirmation from '../components/DeleteConfirmation.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import Loader from '../components/Loader.vue'
import MagazineSettings from '../components/MagazineSettings.vue'
import MainContent from '../components/MainContent/MainContent.vue'
import MetaTags from '../components/MetaTags.vue'
import Modal from '../components/Modal.vue'
import Toolbar from '../components/Toolbar/Toolbar.vue'
import { useMagazineStore } from '../store/magazineStore'
import { getConnectedPeers, getConnectedUsers, initializeCollaboration, isCollaborating, joinSession } from '../utils/collaboration'

const route = useRoute()
const router = useRouter()
const magazineId = computed(() => route.params.id as string)
const magazineStore = useMagazineStore()

// Initialize default values for store properties
const defaultArticles = ref<any[]>([])
const defaultPages = ref(4)
let defaultShowList = true

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isModalOpen = ref(false)
const isHistoryOpen = ref(false)
const isSettingsOpen = ref(false)
const showFlipbook = ref(false)
const editingArticle = ref<any>(null)
const articleToDelete = ref<any>(null)
const collaborationStatus = ref({
  isCollaborating: false,
  peersCount: 0,
})

// Update URL when showList changes
watch(() => magazineStore.showList || defaultShowList, (showList) => {
  const url = new URL(window.location.href)
  url.searchParams.set('view', showList ? 'list' : 'grid')
  window.history.replaceState({}, '', url.toString())
})

// Update collaboration status periodically
onMounted(() => {
  const interval = setInterval(() => {
    collaborationStatus.value = {
      isCollaborating: isCollaborating(),
      peersCount: getConnectedPeers(),
    }

    // Debug user presence
    // console.log('Connected users:', getConnectedUsers())
  }, 1000)

  return () => clearInterval(interval)
})

onMounted(async () => {
  if (!magazineId.value)
    return

  isLoading.value = true
  loadError.value = null

  try {
    // Load magazine data
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]')
    const magazine = magazines.find((m: any) => m.id === magazineId.value)

    if (!magazine) {
      throw new Error('Magazine not found')
    }

    // Initialize collaboration
    initializeCollaboration()

    // Check URL for collaboration session
    const sessionId = route.query.session as string
    const mode = route.query.mode as string

    if (sessionId && mode) {
      console.log('Joining collaboration session:', sessionId)
      if (typeof magazineStore.setConnectionStatus === 'function') {
        magazineStore.setConnectionStatus(true)
      }
      await joinSession(sessionId, mode === 'edit')
      if (typeof magazineStore.setConnectionStatus === 'function') {
        magazineStore.setConnectionStatus(false)
      }
    }

    // Initialize magazine state
    if (typeof magazineStore.syncState === 'function') {
      // Get the magazine state or create a default one
      const magazineState = magazine.state || {
        articles: [],
        pages: 4,
        pageMargins: {},
        zoomLevel: '2',
        showList: true,
        isShared: false,
        allowEdit: true,
        isConnecting: false,
        history: {
          past: [],
          future: [],
        },
      }

      // Ensure title, issueNumber, publicationDate, and pageRatio are set
      magazineState.title = magazine.title || 'My Magazine'
      magazineState.issueNumber = magazine.issue_number || 1
      magazineState.publicationDate = magazine.publication_date || new Date().toISOString()
      magazineState.pageRatio = magazine.page_ratio || '1/1.4142'

      // Sync the state to the store
      magazineStore.syncState({
        magazine: magazineState,
      })
    }

    // When loading magazine, check if it's shared and initialize collaboration
    if (magazine.state && magazine.state.isShared) {
      console.log('Magazine is shared, initializing collaboration...')

      // Set share status in store
      magazineStore.setShareStatus({
        isShared: true,
        allowEdit: magazine.state.allowEdit || true,
        shareId: magazine.state.shareId,
      })

      // Join the collaboration session
      if (magazine.state.shareId) {
        console.log('Joining collaboration session:', magazine.state.shareId)
        joinSession(magazine.state.shareId, magazine.state.allowEdit || false)
      }
    }

    isLoading.value = false
  }
  catch (error) {
    console.error('Error loading magazine:', error)
    loadError.value = 'Failed to load magazine'
    isLoading.value = false
  }
})

// Watch for articles that exceed the current page count
watch(() => magazineStore.articles || defaultArticles.value, (articles) => {
  if (!articles || articles.length === 0)
    return

  const maxPage = articles.reduce((max, article) => {
    if (!article.startPage || !article.pageCount)
      return max
    const endPage = article.startPage + article.pageCount - 1
    return Math.max(max, endPage)
  }, 0)

  if (maxPage > (magazineStore.pages || defaultPages.value)) {
    if (typeof magazineStore.setPages === 'function') {
      magazineStore.setPages(maxPage)
    }
    else {
      defaultPages.value = maxPage
    }
  }
}, { deep: true })

// Check URL for view parameter
onMounted(() => {
  const url = new URL(window.location.href)
  const viewParam = url.searchParams.get('view')
  if (viewParam === 'list' || viewParam === 'grid') {
    if (typeof magazineStore.setShowList === 'function') {
      magazineStore.setShowList(viewParam === 'list')
    }
    else {
      defaultShowList = viewParam === 'list'
    }
  }
})

function calculateStartPage() {
  const articles = magazineStore.articles || defaultArticles.value
  if (!articles || articles.length === 0)
    return 1

  const lastArticle = [...articles].sort((a, b) => {
    if (!a.startPage || !a.pageCount || !b.startPage || !b.pageCount)
      return 0
    const aEndPage = a.startPage + a.pageCount - 1
    const bEndPage = b.startPage + b.pageCount - 1
    return bEndPage - aEndPage
  })[0]

  if (!lastArticle.startPage || !lastArticle.pageCount)
    return 1
  return lastArticle.startPage + lastArticle.pageCount
}

function handleAddArticle(newArticle: any) {
  if (editingArticle.value) {
    if (typeof magazineStore.updateArticle === 'function') {
      magazineStore.updateArticle({
        ...editingArticle.value,
        ...newArticle,
        id: editingArticle.value.id,
        startPage: editingArticle.value.startPage,
      })
    }
    // Make sure we reset the editing article
    editingArticle.value = null
  }
  else {
    const startPage = calculateStartPage()
    if (typeof magazineStore.addArticle === 'function') {
      // Ensure content property is present
      const articleToAdd = {
        ...newArticle,
        id: Math.random().toString(36).substr(2, 9),
        startPage,
        isLocked: false,
        content: newArticle.content || '',
      }

      magazineStore.addArticle(articleToAdd)
    }
  }
  // Always close the modal after adding or updating
  isModalOpen.value = false
}

function handleUpdateArticle(updatedArticle: any) {
  if (typeof magazineStore.updateArticle === 'function') {
    magazineStore.updateArticle(updatedArticle)
  }
}

function handleEditArticle(article: any) {
  editingArticle.value = article
  isModalOpen.value = true
}

function handleDeleteArticle(id: string) {
  const articles = magazineStore.articles || defaultArticles.value
  const article = articles.find((a: any) => a.id === id)
  if (article) {
    articleToDelete.value = article
  }
}

function confirmDelete() {
  if (articleToDelete.value && typeof magazineStore.deleteArticle === 'function') {
    magazineStore.deleteArticle(articleToDelete.value.id)
    articleToDelete.value = null
  }
}

function handleDragEnd(event: any) {
  const { active, over } = event
  const articles = magazineStore.articles || defaultArticles.value

  if (active.id !== over?.id && over && articles) {
    const oldIndex = articles.findIndex((item: any) => item.id === active.id)
    const newIndex = articles.findIndex((item: any) => item.id === over.id)

    // First pass: Calculate new start pages
    let currentPage = 1
    const updatedArticles = [...articles]
    const [movedArticle] = updatedArticles.splice(oldIndex, 1)
    updatedArticles.splice(newIndex, 0, movedArticle)

    const reorderedArticles = updatedArticles.map((article: any) => {
      const newArticle = {
        ...article,
        startPage: currentPage,
      }
      if (article.pageCount) {
        currentPage += article.pageCount
      }
      else {
        currentPage += 1
      }
      return newArticle
    })

    // Update all articles in a single batch
    if (typeof magazineStore.reorderArticles === 'function') {
      magazineStore.reorderArticles(reorderedArticles)
    }
    else {
      // This is a fallback that won't be used in practice
      console.log('reorderArticles not available')
    }
  }
}

function handleAddPage() {
  const currentPages = magazineStore.pages || defaultPages.value
  if (typeof magazineStore.setPages === 'function') {
    magazineStore.setPages(currentPages + 1)
  }
  else {
    defaultPages.value = currentPages + 1
  }
}

function handleRemovePage() {
  const currentPages = magazineStore.pages || defaultPages.value
  if (currentPages > 1) {
    if (typeof magazineStore.setPages === 'function') {
      magazineStore.setPages(currentPages - 1)
    }
    else {
      defaultPages.value = currentPages - 1
    }

    const articles = magazineStore.articles || defaultArticles.value
    if (articles) {
      articles.forEach((article: any) => {
        if (article.startPage === currentPages) {
          if (typeof magazineStore.updateArticle === 'function') {
            magazineStore.updateArticle({
              ...article,
              startPage: currentPages - 1,
            })
          }
        }
      })
    }
  }
}

function handleReorderArticles(articles: any[]) {
  if (typeof magazineStore.reorderArticles === 'function') {
    magazineStore.reorderArticles(articles)
  }
  else {
    console.log('reorderArticles not available')
  }
}
</script>

<template>
  <div class="flex-1 px-4 py-8 bg-gray-100 sm:px-6 lg:px-8">
    <MetaTags
      title="Magazine Flat Plan - FlatMag"
      description="Plan and organize your magazine layout."
    />

    <div v-if="isLoading || magazineStore.isConnecting" class="flex items-center justify-center min-h-screen bg-gray-100">
      <Loader />
    </div>

    <div v-else-if="loadError" class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md p-8 space-y-6 text-center bg-white shadow-lg rounded-xl">
        <div class="flex justify-center">
          <div class="w-16 h-16 text-red-600">
            ⚠️
          </div>
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">
            Error Loading Magazine
          </h2>
          <p class="text-gray-600">
            {{ loadError }}
          </p>
        </div>
        <div class="flex justify-center">
          <button
            class="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            @click="router.push('/magazines')"
          >
            Back to Magazines
          </button>
        </div>
      </div>
    </div>

    <div v-else class="mx-auto max-w-7xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-semibold text-gray-900">
            {{ magazineStore.title }}
          </h2>
          <CollaborationStatus
            :is-sharing="collaborationStatus.isCollaborating"
            :is-editing-allowed="magazineStore.allowEdit"
            :share-id="magazineStore.shareId"
          />
        </div>
        <Toolbar
          :show-list="magazineStore.showList"
          @history-click="isHistoryOpen = !isHistoryOpen"
          @settings-click="isSettingsOpen = true"
          @flipbook-click="showFlipbook = true"
          @view-toggle="typeof magazineStore.setShowList === 'function'
            ? magazineStore.setShowList(!magazineStore.showList)
            : (defaultShowList = !defaultShowList)"
        />
      </div>

      <MainContent
        :show-list="magazineStore.showList"
        :show-flipbook="showFlipbook"
        :articles="magazineStore.articles"
        :pages="magazineStore.pages"
        :zoom-level="magazineStore.zoomLevel"
        :is-editing-allowed="!magazineStore.isShared || magazineStore.allowEdit"
        @add-page="handleAddPage"
        @remove-page="handleRemovePage"
        @edit-article="handleEditArticle"
        @update-article="handleUpdateArticle"
        @delete-article="handleDeleteArticle"
        @reorder-articles="handleReorderArticles"
        @drag-end="handleDragEnd"
        @flipbook-close="showFlipbook = false"
      />

      <button
        :disabled="magazineStore.isShared && !magazineStore.allowEdit"
        class="fixed flex items-center justify-center text-white bg-blue-600 rounded-full shadow-lg bottom-8 right-8 w-14 h-14 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 add-article-button disabled:opacity-50 disabled:cursor-not-allowed"
        @click="() => { editingArticle = null; isModalOpen = true; }"
      >
        <Plus class="w-6 h-6" />
      </button>

      <Modal :is-open="isModalOpen" @close="() => { isModalOpen = false; editingArticle = null; }">
        <ArticleForm
          :article="editingArticle"
          @add="handleAddArticle"
          @delete="handleDeleteArticle"
        />
      </Modal>

      <HistoryPanel
        :is-open="isHistoryOpen"
        @close="isHistoryOpen = false"
      />

      <MagazineSettings
        :is-open="isSettingsOpen"
        @close="isSettingsOpen = false"
      />

      <DeleteConfirmation
        :title="articleToDelete?.title || ''"
        :is-open="!!articleToDelete"
        @confirm="confirmDelete"
        @cancel="articleToDelete = null"
      />

      <CursorOverlay v-if="collaborationStatus.isCollaborating" />
    </div>
  </div>
</template>
