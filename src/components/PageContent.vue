<script setup lang="ts">
import type { Article } from '../types'
import { computed, ref } from 'vue'
import { calculatePageAvailableSpace } from '../utils/calculations'
import { validateVisualPosition } from '../utils/imageHandler/index'
import DraggableVisual from './DraggableVisual.vue'
import TextLines from './TextLines.vue'

const props = withDefaults(defineProps<{
  article: Article
  pageIndex: number
  isFlipbook?: boolean
  margins: { top: number, right: number, bottom: number, left: number }
  isEditingAllowed: boolean
}>(), {
  isFlipbook: false,
})

const emit = defineEmits<{
  (e: 'editArticle', article: Article): void
  (e: 'updateArticle', article: Article): void
}>()

// Default margins fallback
const DEFAULT_MARGINS = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
}

// Interface extension for article with margins
interface ArticleWithMargins extends Article {
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const pageContainer = ref<HTMLElement | null>(null)

// Use article-specific margins if available, otherwise use the default or page margins
const effectiveMargins = computed(() => {
  return (props.article as ArticleWithMargins)?.margins || props.margins || DEFAULT_MARGINS
})

const currentPage = computed(() => props.pageIndex + 1)
const page = computed(() => props.article?.pages?.find?.(p => p.pageNumber === currentPage.value) || null)

function handleDragEnd(visualId: string, deltaX: number, deltaY: number) {
  if (!props.article || props.article.isLocked || !props.isEditingAllowed)
    return

  const container = pageContainer.value || document.getElementById(`article-${props.article.id}-page-${props.pageIndex}`)
  if (!container)
    return

  const rect = container.getBoundingClientRect()
  const visual = props.article.visuals?.find?.(v => v.id === visualId)

  if (!visual)
    return

  // If delta is too small, don't update the position
  // This prevents accidental minor movements from triggering updates
  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    console.log('[PageContent] Ignoring very small drag movement')
    return
  }

  // Convert pixel deltas to percentage of container
  const deltaXPercent = (deltaX / rect.width) * 100
  const deltaYPercent = (deltaY / rect.height) * 100

  const newPosition = validateVisualPosition(
    {
      ...visual,
      x: visual.x + deltaXPercent,
      y: visual.y + deltaYPercent,
    },
    rect.width,
    rect.height,
  )

  // Determine the absolute page number in the magazine where the user is currently interacting
  const absolutePageNumber = props.isFlipbook
    ? props.pageIndex + 1 // In grid view, pageIndex is 0-based absolute index
    : currentPage.value // In normal view, we use currentPage directly

  // Calculate the article-relative page number (1-based)
  const articleStartPage = props.article.startPage || 1
  const articleRelativePage = absolutePageNumber - articleStartPage + 1

  // Make sure we're still within the article's page range
  if (articleRelativePage >= 1 && articleRelativePage <= props.article.pageCount) {
    // Log the page change if applicable
    const pageChanged = visual.page !== articleRelativePage
    if (pageChanged) {
      console.log('[PageContent] Visual moved to new page:', {
        visualId,
        oldPage: visual.page,
        newPage: articleRelativePage,
      })
    }

    // Create a new reference for each visual to ensure reactivity
    const updatedVisuals = props.article.visuals?.map?.(v =>
      v.id === visualId
        ? {
            ...v,
            ...newPosition,
            page: articleRelativePage, // Save the article-relative page number
            _dragTimeStamp: Date.now(), // Add timestamp to force update detection
          }
        : { ...v }, // Create a new reference for other visuals too
    ) || []

    // Recalculate available space for each page with the updated visuals
    const updatedPages = props.article.pages?.map?.((page) => {
      const pageVisuals = updatedVisuals.filter(v => v.page === page.pageNumber)

      // Create a safe deep copy of the page using JSON parse/stringify
      return {
        ...JSON.parse(JSON.stringify(page)),
        visuals: pageVisuals,
        availableSpace: calculatePageAvailableSpace(pageVisuals, effectiveMargins.value),
        _pageUpdated: Date.now(), // Add timestamp to force page update detection
      }
    }) || []

    // Add debug logging to trace the update flow
    console.log('[PageContent] Emitting article update with new image position:', {
      visualId,
      oldPosition: {
        x: visual.x,
        y: visual.y,
        page: visual.page,
      },
      newPosition: {
        x: newPosition.x,
        y: newPosition.y,
        page: articleRelativePage,
      },
      pageChanged,
      isDelta: true,
      deltaX,
      deltaY,
    })

    // Create a completely new article object to ensure reactive updates
    // Use JSON parse/stringify for safe cloning instead of structuredClone
    const updatedArticle = JSON.parse(JSON.stringify(props.article))

    // Update with our new data
    updatedArticle.visuals = updatedVisuals
    updatedArticle.pages = updatedPages

    // Add multiple timestamp flags to ensure changes are detected and broadcast
    updatedArticle._lastUpdated = Date.now() // Force update detection
    updatedArticle._dragUpdateTimestamp = Date.now()
    updatedArticle._broadcastTimestamp = Date.now() // Critical for ensuring broadcast
    updatedArticle._visualMoved = {
      visualId,
      from: { x: visual.x, y: visual.y, page: visual.page },
      to: { x: newPosition.x, y: newPosition.y, page: articleRelativePage },
    }

    // Immediately emit the update to ensure it's propagated to other users
    // This ensures the UI updates immediately without waiting for the store
    emit('updateArticle', updatedArticle)
  }
}

const isCurrentPageFull = computed(() => props.article?.visuals?.some?.(v =>
  v.width === 'full' && v.height === 'full' && v.page === currentPage.value,
) || false)

const visualsOnCurrentPage = computed(() => {
  // No article data available
  if (!props.article?.visuals)
    return []

  // Get visuals for the current page
  return props.article.visuals.filter((v) => {
    // Make sure page is defined
    if (v.page === undefined)
      return false

    // Magazine absolute page number where we're currently viewing
    const absolutePageNumber = props.isFlipbook
      ? props.pageIndex + 1 // In grid view, pageIndex is 0-based absolute index
      : currentPage.value // In normal view, we're using currentPage directly

    // For any view: check if visual belongs on current absolute page
    const articleStartPage = props.article.startPage || 1
    const visualAbsolutePageNumber = articleStartPage + (v.page - 1)

    return visualAbsolutePageNumber === absolutePageNumber
  })
})

// Add a reactive tracker to force visual updates when positions change
const visualPositionTracker = computed(() => {
  if (!props.article?.visuals)
    return Date.now()

  // Generate a string that will change when any visual position changes
  return props.article.visuals.map(v => `${v.id}:${v.x}:${v.y}:${v.page}`).join('|')
})

// Calculate word count for this specific page
const pageWordCount = computed(() => {
  if (!page.value)
    return 0

  // Use the page's calculated word count if available
  if (page.value.wordCount !== undefined) {
    return page.value.wordCount
  }

  // Otherwise, estimate based on total word count and page count
  if (props.article?.wordCount && props.article?.pageCount) {
    return Math.floor(props.article.wordCount / props.article.pageCount)
  }

  return 0
})

// Check if the article has content that should be displayed
const hasArticleContent = computed(() => {
  return (props.article?.wordCount && props.article?.wordCount > 0)
    || (props.article?.visuals?.length && props.article?.visuals?.length > 0)
})

// Ensure we have a valid word count to display
const displayWordCount = computed(() => {
  if (pageWordCount.value > 0)
    return pageWordCount.value

  // Fallback to estimating from total word count
  if (props.article?.wordCount && props.article?.wordCount > 0) {
    return Math.ceil(props.article.wordCount / (props.article?.pageCount || 1))
  }

  // Default to some text if we have an article but word count is missing
  return props.article ? 100 : 0
})

// Calculate available space, defaulting to 100 if not specified
const availablePageSpace = computed(() => {
  if (page.value && page.value.availableSpace !== undefined)
    return page.value.availableSpace

  // If no space calculation exists but we have visuals, we need to calculate
  if (visualsOnCurrentPage.value.length > 0) {
    return 100 - visualsOnCurrentPage.value.reduce((total, visual) => {
      const width = visual.width === 'full' ? 100 : Number(visual.width.split('/')[0]) / Number(visual.width.split('/')[1]) * 100
      const height = visual.height === 'full' ? 100 : Number(visual.height.split('/')[0]) / Number(visual.height.split('/')[1]) * 100
      return total + (width * height / 100) // Approximate space taken
    }, 0)
  }

  return 100 // Default to full space available
})
</script>

<template>
  <div ref="pageContainer" class="h-full w-full">
    <div
      :id="`article-${article?.id || 'unknown'}-page-${pageIndex}`"
      class="h-full w-full rounded-sm overflow-hidden bg-white"
    >
      <!-- Content area with margins applied -->
      <div
        class="h-full w-full relative"
        :style="{
          padding: `${effectiveMargins.top}% ${effectiveMargins.right}% ${effectiveMargins.bottom}% ${effectiveMargins.left}%`,
        }"
      >
        <!-- Text lines with flow around images -->
        <TextLines
          v-if="!isCurrentPageFull && hasArticleContent && displayWordCount > 0"
          :word-count="displayWordCount"
          :available-space="availablePageSpace"
          :columns="article?.columns || 1"
          :line-height="article?.lineHeight || '1/50'"
          :margins="{ top: 0, right: 0, bottom: 0, left: 0 }"
          :visuals="visualsOnCurrentPage"
          class="h-full w-full"
        />

        <!-- Visuals (images) that can be dragged -->
        <DraggableVisual
          v-for="visual in visualsOnCurrentPage"
          :key="`${visual.id}-${visualPositionTracker}`"
          :visual="visual"
          :is-locked="article?.isLocked || isFlipbook"
          :current-page="currentPage"
          :article="article"
          @update-article="$emit('updateArticle', $event)"
          @drag-end="handleDragEnd"
        />

        <!-- Show page guide if no text or visuals -->
        <div
          v-if="!isCurrentPageFull && visualsOnCurrentPage.length === 0 && !hasArticleContent"
          class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded"
        >
          <div class="text-center">
            <p>Empty page</p>
            <p class="text-xs">
              Add text or visuals in article settings
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
