<script setup lang="ts">
import type { Article, SizeRatio, Visual } from '../types'
import { useDraggable } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { getImageUrl } from '../utils/imageHandler'

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
const initialPosition = ref({ x: 0, y: 0 })

// Use VueUse's draggable composable
const { isDragging, style, x, y } = useDraggable(el, {
  initialValue: { x: 0, y: 0 },
  preventDefault: true,
  stopPropagation: true,
  containerElement: () => {
    return document.getElementById(`article-${props.article.id}-page-${props.currentPage - 1}`)
  },
  onStart: () => {
    // Store initial position when drag starts
    initialPosition.value = { x: x.value, y: y.value }
  },
  onEnd: () => {
    if (isDragDisabled.value)
      return

    // Calculate delta between end and start positions
    const deltaX = x.value - initialPosition.value.x
    const deltaY = y.value - initialPosition.value.y

    // Reset position to 0 for next drag (actual position is stored in article data)
    x.value = 0
    y.value = 0

    // Emit the change to parent with the deltas
    emit('dragEnd', props.visual.id, deltaX, deltaY)
  },
})

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
    const imageUrl = await getImageUrl(url)
    if (imageUrl) {
      loadingState.value.isLoading = false
      loadingState.value.retryCount = 0
    }
    else {
      throw new Error('Failed to load image')
    }
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
    :style="[visualStyle, style]"
    class="absolute rounded-sm overflow-hidden select-none touch-none"
    :class="{ 'ring-2 ring-blue-500': isDragging, 'pointer-events-none': isDragDisabled }"
  >
    <img
      v-if="visual.type === 'image' && visual.url"
      :src="visual.url"
      :alt="visual.title || 'Visual'"
      class="w-full h-full object-cover"
      draggable="false"
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
