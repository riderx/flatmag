<script setup lang="ts">
import type { Article } from '../../types'
import { PageFlip } from 'page-flip'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PageContent from '../PageContent.vue'
import Navigation from './Navigation.vue'

// Define props
const props = defineProps<{
  articles: Article[]
  pages: number
}>()

// Define emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'editArticle', article: Article): void
  (e: 'updateArticle', article: Article): void
}>()

// Refs for DOM elements and state
const bookElement = ref<HTMLElement | null>(null)
const pagesContainer = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const pageFlip = ref<any>(null)

// Get articles for the current page
function getArticlesForPage(pageIndex: number) {
  return props.articles.filter((article: Article) => {
    const startPage = article.startPage || 1 // Default to page 1 if not specified
    const endPage = startPage + (article.pageCount || 1) - 1 // Default to 1 page if not specified
    return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage
  })
}

// Create array for all pages
const allPages = computed(() => {
  const pages = []
  for (let i = 0; i < props.pages; i++) {
    pages.push({
      pageIndex: i,
      articles: getArticlesForPage(i),
    })
  }
  return pages
})

// Handle events
const handleClose = () => emit('close')
const handleEditArticle = (article: Article) => emit('editArticle', article)
const handleUpdateArticle = (article: Article) => emit('updateArticle', article)

// Handle navigation from the Navigation component
function handleFlip(direction: 'left' | 'right') {
  if (!pageFlip.value)
    return

  if (direction === 'left') {
    pageFlip.value.flipPrev('bottom')
  }
  else {
    pageFlip.value.flipNext('bottom')
  }
}

// Initialize the PageFlip instance
function initPageFlip() {
  if (!bookElement.value)
    return

  // Create new PageFlip instance
  pageFlip.value = new PageFlip(bookElement.value, {
    width: 550, // Base page width
    height: 733, // Base page height (based on A4 proportions)
    size: 'stretch',
    minWidth: 320,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1533,
    maxShadowOpacity: 0.5,
    showCover: false,
    usePortrait: true,
    flippingTime: 1000,
    useMouseEvents: true,
    drawShadow: true,
    startPage: 0,
  })

  // Add event listeners
  pageFlip.value.on('flip', (e: any) => {
    currentPage.value = e.data
  })

  // Load pages
  if (pagesContainer.value) {
    pageFlip.value.loadFromHTML(pagesContainer.value.querySelectorAll('.page'))
  }
}

onMounted(() => {
  // Initialize PageFlip
  setTimeout(() => {
    initPageFlip()
  }, 100)
})

onUnmounted(() => {
  // Clean up
  if (pageFlip.value) {
    pageFlip.value.destroy()
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="w-[90vw] h-[80vh] relative flex flex-col">
      <!-- Main Flipbook content -->
      <div class="flex-grow flex flex-col">
        <!-- The book container -->
        <div ref="bookElement" class="book-container flex-grow">
          <!-- Hidden container with page HTML elements -->
          <div ref="pagesContainer" class="hidden">
            <div
              v-for="(page, index) in allPages"
              :key="`page-${index}`"
              class="page"
              :data-density="index === 0 || index === allPages.length - 1 ? 'hard' : 'soft'"
            >
              <div class="bg-white h-full w-full p-4">
                <PageContent
                  v-if="page.articles[0]"
                  :article="page.articles[0]"
                  :page-index="page.pageIndex"
                  :is-flipbook="true"
                  :margins="{ top: 5, right: 5, bottom: 5, left: 5 }"
                  :is-editing-allowed="true"
                  @edit-article="handleEditArticle"
                  @update-article="handleUpdateArticle"
                />
                <div v-else class="h-full flex items-center justify-center text-gray-400">
                  Page {{ page.pageIndex + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation controls -->
      <Navigation
        :current-page="currentPage"
        :total-pages="props.pages"
        :is-flipping="false"
        @flip="handleFlip"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<style scoped>
/* Add custom styles for the flipbook view */
.book-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.page {
  color: #333;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

:deep(.--left) {
  border-radius: 4px 0 0 4px;
}

:deep(.--right) {
  border-radius: 0 4px 4px 0;
}

:deep(.stf__parent) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.stf__block) {
  border-radius: 4px;
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.1);
}

:deep(.stf__item) {
  height: 100% !important;
  width: 100% !important;
}
</style>
