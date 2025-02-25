<script setup lang="ts">
import type { Article } from '../types'
import { computed } from 'vue'
import { calculatePageAvailableSpace } from '../utils/calculations'
import { validateVisualPosition } from '../utils/imageHandler'
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

function handleDragEnd(visualId: string, deltaX: number, deltaY: number) {
  if (props.article.isLocked || !props.isEditingAllowed)
    return

  const container = document.getElementById(`article-${props.article.id}-page-${props.pageIndex}`)
  if (!container)
    return

  const rect = container.getBoundingClientRect()
  const currentPageValue = props.pageIndex + 1
  const visual = props.article.visuals.find(v => v.id === visualId)

  if (!visual)
    return

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

  if (currentPageValue >= props.article.startPage && currentPageValue <= props.article.startPage + props.article.pageCount - 1) {
    const updatedVisuals = props.article.visuals.map(v =>
      v.id === visualId
        ? {
            ...v,
            ...newPosition,
            page: currentPageValue,
          }
        : v,
    )

    const updatedPages = props.article.pages.map((page) => {
      const pageVisuals = updatedVisuals.filter(v => v.page === page.pageNumber)
      return {
        ...page,
        visuals: pageVisuals,
        availableSpace: calculatePageAvailableSpace(pageVisuals),
      }
    })

    emit('updateArticle', {
      ...props.article,
      visuals: updatedVisuals,
      pages: updatedPages,
    })
  }
}

const currentPage = computed(() => props.pageIndex + 1)
const page = computed(() => props.article.pages.find(p => p.pageNumber === currentPage.value))

const isCurrentPageFull = computed(() => props.article.visuals.some(v =>
  v.width === 'full' && v.height === 'full' && v.page === currentPage.value,
))

const visualsOnCurrentPage = computed(() =>
  props.article.visuals.filter(v => v.page === currentPage.value),
)
</script>

<template>
  <div>
    <div
      :id="`article-${article.id}-page-${pageIndex}`"
      class="relative h-full rounded-sm overflow-hidden"
      :style="{
        padding: `${margins.top}% ${margins.right}% ${margins.bottom}% ${margins.left}%`,
      }"
    >
      <div class="h-full relative">
        <TextLines
          v-if="!isCurrentPageFull && page"
          :word-count="page.wordCount"
          :available-space="page.availableSpace"
          :columns="article.columns"
          :line-height="article.lineHeight"
          :margins="margins"
          :visuals="page ? page.visuals : []"
        />
        <DraggableVisual
          v-for="visual in visualsOnCurrentPage"
          :key="visual.id"
          :visual="visual"
          :is-locked="article.isLocked || isFlipbook"
          :current-page="currentPage"
          :article="article"
          @update-article="$emit('updateArticle', $event)"
          @drag-end="handleDragEnd"
        />
      </div>
    </div>
  </div>
</template>
