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
    width: 550, // Wider for better visibility
    height: 733, // Standard A4 proportion
    size: 'fixed', // Fixed size for better stability
    minWidth: 300,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1200,
    maxShadowOpacity: 0.2, // Reduced shadow opacity
    showCover: true,
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
  // Initialize PageFlip with a slight delay to ensure DOM is ready
  setTimeout(() => {
    initPageFlip()
  }, 300)
})

onUnmounted(() => {
  // Clean up
  if (pageFlip.value) {
    pageFlip.value.destroy()
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
    <div class="relative w-[90vw] max-w-[1200px] h-[80vh] flex flex-col items-center justify-center">
      <!-- Flipbook container -->
      <div class="w-full flex-1 flex items-center justify-center">
        <div ref="bookElement" class="flipbook">
          <!-- Pages container (hidden) -->
          <div ref="pagesContainer" class="hidden">
            <div
              v-for="(page, index) in allPages"
              :key="`page-${index}`"
              class="page"
              :data-density="index === 0 || index === allPages.length - 1 ? 'hard' : 'soft'"
            >
              <div class="page-content">
                <PageContent
                  v-if="page.articles[0]"
                  :article="page.articles[0]"
                  :page-index="page.pageIndex"
                  :is-flipbook="true"
                  :margins="{ top: 4, right: 4, bottom: 4, left: 4 }"
                  :is-editing-allowed="true"
                  @edit-article="handleEditArticle"
                  @update-article="handleUpdateArticle"
                />
                <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                  Page {{ page.pageIndex + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation controls -->
      <div class="mt-4">
        <Navigation
          :current-page="currentPage"
          :total-pages="props.pages"
          :is-flipping="false"
          @flip="handleFlip"
          @close="handleClose"
        />
      </div>
    </div>
  </div>
</template>

<style>
/* Flipbook container */
.flipbook {
  width: 100%;
  height: 100%;
  display: block;
}

/* Page styles */
.page {
  background-color: white;
}

.page-content {
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: white;
  overflow: hidden;
}

/* PageFlip specific styles (these must be global) */
.stf__parent {
  position: absolute;
}

.stf__wrapper {
  position: relative !important;
}

.stf__block {
  border-radius: 5px;
  /* Only show shadow during flipping */
  box-shadow: none;
}

/* Shadow only appears on flipping pages */
.stf__block.--left.--flipping,
.stf__block.--right.--flipping {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.stf__item {
  background-color: white;
}

.--left {
  border-radius: 5px 0 0 5px;
}

.--right {
  border-radius: 0 5px 5px 0;
}
</style>
