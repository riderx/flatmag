<script setup lang="ts">
import type { Article, SizeRatio, Visual } from '../types'
import { useDraggable } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { getImageUrl } from '../utils/imageHandler/index'

interface ImageLoadingState {
  isLoading: boolean
  error: string | null
  retryCount: number
}

const props = defineProps<{
  visual: Visual
  isLocked: boolean
  currentPage: number
  article: Article
}>()

const emit = defineEmits<{
  (e: 'updateArticle', article: Article): void
  (e: 'dragEnd', id: string, deltaX: number, deltaY: number): void
}>()

const loadingState = ref<ImageLoadingState>({
  isLoading: false,
  error: null,
  retryCount: 0,
})

const isDragDisabled = computed(() => props.isLocked)

// Element to be dragged
const el = ref<HTMLElement | null>(null)

// Handle dragging manually without relying on transform style
const isDragging = ref(false)
let startX = 0
let startY = 0
let deltaX = 0
let deltaY = 0

function handleMouseDown(e: MouseEvent) {
  if (isDragDisabled.value)
    return

  isDragging.value = true
  startX = e.clientX
  startY = e.clientY
  deltaX = 0
  deltaY = 0

  // Add event listeners to document for tracking mouse movement outside the element
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  e.preventDefault()
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value)
    return

  deltaX = e.clientX - startX
  deltaY = e.clientY - startY

  // Update visual style directly
  if (el.value) {
    el.value.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }
}

function handleMouseUp() {
  if (!isDragging.value)
    return

  isDragging.value = false

  // Clean up event listeners
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // Reset transform
  if (el.value) {
    el.value.style.transform = 'none'
  }

  // Calculate container dimensions to convert to percent
  const container = document.getElementById(`article-${props.article.id}-page-${props.currentPage - 1}`)
  if (container && deltaX !== 0 && deltaY !== 0) {
    // Emit the change to parent with the deltas
    emit('dragEnd', props.visual.id, deltaX, deltaY)
  }
}

// Convert size ratio to percentage
function sizeToPercent(size: SizeRatio): number {
  switch (size) {
    case 'full': return 100
    case '1/2': return 50
    case '1/3': return 33.33
    case '1/4': return 25
    case '1/6': return 16.67
    case '1/8': return 12.5
    case '1/10': return 10
    default: return 50
  }
}

// Watch for URL changes to load images
watch(() => props.visual.url, (newUrl) => {
  if (newUrl) {
    loadImage(newUrl)
  }
}, { immediate: true })

// Load image with retry logic
async function loadImage(url: string) {
  if (!url)
    return

  loadingState.value.isLoading = true
  loadingState.value.error = null

  try {
    // Use the getImageUrl utility which handles conversion for non-base64 URLs
    const imageUrl = await getImageUrl(url)

    // Pre-load the image to ensure we track loading state properly
    const img = new Image()

    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(true)
      img.onerror = () => reject(new Error('Failed to load image'))

      // Set src after adding event listeners
      img.src = imageUrl
    })

    await loadPromise

    // Update loading state on success
    loadingState.value.isLoading = false
    loadingState.value.retryCount = 0
  }
  catch (error) {
    loadingState.value.isLoading = false
    loadingState.value.error = error instanceof Error ? error.message : 'Unknown error'

    // Retry logic
    if (loadingState.value.retryCount < 3) {
      loadingState.value.retryCount++
      setTimeout(() => loadImage(url), 1000 * loadingState.value.retryCount)
    }
  }
}

// Computed styles for the visual
const visualStyle = computed(() => {
  const width = sizeToPercent(props.visual.width as SizeRatio)
  const height = sizeToPercent(props.visual.height as SizeRatio)

  return {
    width: `${width}%`,
    height: `${height}%`,
    left: `${props.visual.x}%`,
    top: `${props.visual.y}%`,
    cursor: isDragDisabled.value ? 'default' : isDragging.value ? 'grabbing' : 'grab',
    zIndex: props.visual.width === 'full' && props.visual.height === 'full' ? 0 : isDragging.value ? 10 : 1,
  }
})
</script>

<template>
  <div
    ref="el"
    :style="visualStyle"
    class="absolute rounded-sm overflow-hidden select-none touch-none"
    :class="{ 'ring-2 ring-blue-500': isDragging, 'pointer-events-none': isDragDisabled }"
    @mousedown="handleMouseDown"
  >
    <!-- Loading state -->
    <div
      v-if="loadingState.isLoading && visual.type === 'image'"
      class="w-full h-full bg-gray-100 flex flex-col items-center justify-center"
    >
      <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2" />
      <span class="text-sm text-gray-500">Loading image...</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="loadingState.error && visual.type === 'image'"
      class="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4"
    >
      <svg class="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span class="text-sm text-red-500 text-center">Failed to load image</span>
    </div>

    <!-- Image when loaded -->
    <img
      v-else-if="visual.type === 'image' && visual.url"
      :src="visual.url"
      :alt="visual.title || 'Visual'"
      class="w-full h-full object-cover"
      draggable="false"
      @load="loadingState.isLoading = false"
      @error="loadingState.error = 'Failed to load image'"
    >

    <div
      v-else-if="visual.type === 'illustration'"
      class="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
    >
      <span class="text-gray-500">Illustration</span>
    </div>
    <div
      v-else
      class="w-full h-full bg-gray-200 flex items-center justify-center"
    >
      <span class="text-gray-500">{{ visual.title || 'No media' }}</span>
    </div>
  </div>
</template>
