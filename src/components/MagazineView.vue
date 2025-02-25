<script setup lang="ts">
import type { Article, ZoomLevel } from '../types'
import { Grid, Grid2X2, Maximize2, Minus, Plus, ZoomIn } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMagazineStore } from '../store/magazineStore'
import PageContent from './PageContent.vue'
import PageHeader from './PageHeader.vue'

const props = defineProps<{
  articles: Article[]
  pages: number
  zoomLevel: ZoomLevel
  isEditingAllowed: boolean
}>()

defineEmits<{
  (e: 'addPage'): void
  (e: 'removePage'): void
  (e: 'editArticle', article: Article): void
  (e: 'updateArticle', article: Article): void
}>()

const DEFAULT_MARGINS = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
}

const containerRef = ref<HTMLDivElement | null>(null)
const containerWidth = ref(0)
const magazineStore = useMagazineStore()

// Mock pageMargins since we don't have access to the actual store
const pageMargins = ref<Record<number, typeof DEFAULT_MARGINS>>({})

function getPageMargins(pageNumber: number) {
  return pageMargins.value[pageNumber] || DEFAULT_MARGINS
}

function updatePageMargins(page: number, margins: typeof DEFAULT_MARGINS) {
  pageMargins.value = {
    ...pageMargins.value,
    [page]: margins,
  }
}

function updateWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

function getPagesPerRow(zoom: ZoomLevel) {
  if (containerWidth.value < 768) {
    return 1
  }
  switch (zoom) {
    case 'all': return containerWidth.value < 1024 ? 2 : containerWidth.value < 1280 ? 3 : containerWidth.value < 1536 ? 4 : 6
    case '4': return containerWidth.value < 1024 ? 2 : 4
    case '2': return containerWidth.value < 1024 ? 1 : 2
    case '1': return 1
    default: return 2
  }
}

const pagesPerRow = computed(() => getPagesPerRow(props.zoomLevel))

const pageDimensions = computed(() => {
  const [num, den] = magazineStore.pageRatio.split('/').map(Number) || [1, 1.4142]
  const gapSize = 32
  const totalGaps = pagesPerRow.value - 1
  const availableWidth = containerWidth.value - (totalGaps * gapSize)
  const pageWidth = Math.floor(availableWidth / pagesPerRow.value)
  const pageHeight = Math.floor(pageWidth * (den / num))
  return { width: pageWidth, height: pageHeight }
})

function getPageScale(zoom: ZoomLevel) {
  const baseScale = {
    all: containerWidth.value < 768 ? 0.95 : containerWidth.value < 1280 ? 0.92 : 0.88,
    4: containerWidth.value < 768 ? 0.95 : containerWidth.value < 1024 ? 0.92 : 0.85,
    2: 1,
    1: containerWidth.value < 768 ? 0.95 : 1.1,
  }
  return baseScale[zoom] || 1
}

function getArticlesForPage(pageIndex: number) {
  return props.articles.filter((article) => {
    const startPage = article.startPage
    const endPage = startPage + (article.pageCount || 1) - 1
    return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage
  })
}
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ magazineStore.title }}
          </h2>
          <div class="text-sm text-gray-500">
            Issue {{ magazineStore.issueNumber }} • {{ new Date(magazineStore.publicationDate).toLocaleDateString() }}
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            :disabled="!isEditingAllowed || pages <= 1"
            :class="`p-1 ${isEditingAllowed ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`"
            @click="$emit('removePage')"
          >
            <Minus class="w-5 h-5" />
          </button>
          <span class="text-gray-700">{{ pages }} pages</span>
          <button
            :disabled="!isEditingAllowed"
            :class="`p-1 ${isEditingAllowed ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`"
            @click="$emit('addPage')"
          >
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          :class="`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
            zoomLevel === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`"
          @click="magazineStore.setZoomLevel('all')"
        >
          <Maximize2 class="w-4 h-4" />
          <span class="ml-2 hidden sm:inline">All</span>
        </button>
        <button
          :class="`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
            zoomLevel === '4'
              ? 'border-blue-600 text-blue-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`"
          @click="magazineStore.setZoomLevel('4')"
        >
          <Grid2X2 class="w-4 h-4" />
          <span class="ml-2 hidden sm:inline">4 Pages</span>
        </button>
        <button
          :class="`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
            zoomLevel === '2'
              ? 'border-blue-600 text-blue-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`"
          @click="magazineStore.setZoomLevel('2')"
        >
          <Grid class="w-4 h-4" />
          <span class="ml-2 hidden sm:inline">2 Pages</span>
        </button>
        <button
          :class="`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
            zoomLevel === '1'
              ? 'border-blue-600 text-blue-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`"
          @click="magazineStore.setZoomLevel('1')"
        >
          <ZoomIn class="w-4 h-4" />
          <span class="ml-2 hidden sm:inline">1 Page</span>
        </button>
      </div>
    </div>

    <div
      ref="containerRef"
      :class="`grid ${zoomLevel === 'all' ? 'gap-2' : 'gap-8'} w-full`"
      :style="{
        gridTemplateColumns: `repeat(${pagesPerRow}, minmax(0, 1fr))`,
        transform: `scale(${getPageScale(zoomLevel)})`,
        transformOrigin: 'top left',
        maxWidth: zoomLevel === 'all' ? '100vw' : undefined,
        margin: zoomLevel === 'all' ? '-1rem' : undefined,
      }"
    >
      <div
        v-for="(_, pageIndex) in Array.from({ length: pages })"
        :key="pageIndex"
        class="space-y-4"
      >
        <PageHeader
          :page-number="pageIndex + 1"
          :article="getArticlesForPage(pageIndex)[0]"
          :margins="getPageMargins(pageIndex + 1)"
          :is-editing-allowed="isEditingAllowed"
          @margins-change="(newMargins) => updatePageMargins(pageIndex + 1, newMargins)"
          @edit-article="$emit('editArticle', $event)"
          @update-article="$emit('updateArticle', $event)"
        />
        <div
          class="bg-white rounded-lg shadow-lg mx-auto"
          :style="{
            width: `${pageDimensions.width}px`,
            height: `${pageDimensions.height}px`,
            maxWidth: '100%',
          }"
        >
          <template v-if="getArticlesForPage(pageIndex)[0]">
            <PageContent
              :key="getArticlesForPage(pageIndex)[0].id"
              :article="getArticlesForPage(pageIndex)[0]"
              :page-index="pageIndex || 0"
              :margins="getPageMargins(pageIndex + 1)"
              :is-editing-allowed="isEditingAllowed"
              @edit-article="$emit('editArticle', $event)"
              @update-article="$emit('updateArticle', $event)"
            />
          </template>
          <div
            v-else
            class="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
          >
            <span class="text-gray-400">Empty Page</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
