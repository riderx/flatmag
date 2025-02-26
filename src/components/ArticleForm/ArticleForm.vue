<script setup lang="ts">
import type { LineHeight, Tag, Visual } from '../../types'
import { PlusCircle, Trash2, Wand2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useTagStore } from '../../store/tagStore'
import { generateRandomArticle } from '../../utils/articleGenerator'
import { calculateRequiredPages, ratioToPercent } from '../../utils/calculations'
import BasicInfo from './BasicInfo.vue'
import { DEFAULT_MARGINS } from './constants'
import ContentLength from './ContentLength.vue'
import MarginSettings from './MarginSettings.vue'
import Visuals from './Visuals.vue'

const props = defineProps<{
  article?: any
}>()

const emit = defineEmits<{
  (e: 'add', article: any): void
  (e: 'delete', id: string): void
}>()

// Get tags from the Pinia store
const tagStore = useTagStore()
const availableTags = computed(() => tagStore.tags)

const title = ref(props.article?.title || '')
const url = ref(props.article?.url || '')
const tags = ref<Tag[]>(props.article?.tags || [])
const wordCount = ref(props.article?.wordCount?.toString() || '')
const pageCount = ref(props.article?.pageCount?.toString() || '1')
const columns = ref<1 | 2 | 3>(props.article?.columns || 1)
const visuals = ref<Visual[]>(props.article?.visuals || [])
const useWordCount = ref(true)
const lineHeight = ref<LineHeight>(props.article?.lineHeight || '1/50')
const margins = ref(props.article?.margins || { ...DEFAULT_MARGINS })

// Watch for changes in wordCount, lineHeight, columns, and visuals
// to update pageCount when using wordCount
watch([wordCount, useWordCount, lineHeight, columns, visuals, margins], () => {
  if (useWordCount.value) {
    const words = Number.parseInt(wordCount.value) || 0
    // Use the same calculation as in ContentLength.vue
    const baseWordsPerPage = 600
    const wordsPerPage = baseWordsPerPage * columns.value
    // Adjust for margins - each percent of margin reduces content space
    const marginReduction = (margins.value.top + margins.value.bottom + margins.value.left + margins.value.right) / 100
    const adjustedWordsPerPage = Math.floor(wordsPerPage * (1 - marginReduction))

    const pagesForWords = Math.max(1, Math.ceil(words / adjustedWordsPerPage))
    const pagesForVisuals = calculateRequiredPages(visuals.value)
    const calculatedPages = Math.max(pagesForWords, pagesForVisuals)
    pageCount.value = calculatedPages.toString()
  }
})

// Watch for changes in visuals to update pageCount when not using wordCount
watch([visuals, useWordCount, pageCount], () => {
  if (!useWordCount.value) {
    const pagesForVisuals = calculateRequiredPages(visuals.value)
    const currentPages = Number.parseInt(pageCount.value) || 1
    if (pagesForVisuals > currentPages) {
      pageCount.value = pagesForVisuals.toString()
    }
  }
})

function handleSubmit(e: Event) {
  e.preventDefault()
  const totalPages = Number.parseInt(pageCount.value) || 1
  // Use the same calculation as in ContentLength.vue
  const baseWordsPerPage = 600
  const wordsPerPage = baseWordsPerPage * columns.value
  // Adjust for margins
  const marginReduction = (margins.value.top + margins.value.bottom + margins.value.left + margins.value.right) / 100
  const adjustedWordsPerPage = Math.floor(wordsPerPage * (1 - marginReduction))

  // Ensure visuals have valid page numbers
  const updatedVisuals = visuals.value.map(visual => ({
    ...visual,
    page: Math.min(Math.max(1, visual.page || 1), totalPages),
    spaceOccupied: (ratioToPercent(visual.width) * ratioToPercent(visual.height)) / 100,
  }))

  // Construct the article object
  const articleData = {
    id: props.article?.id, // Make sure to include the ID if editing an existing article
    title: title.value,
    content: props.article?.content || '',
    tags: tags.value,
    url: url.value,
    wordCount: useWordCount.value ? (Number.parseInt(wordCount.value) || 0) : 0,
    pageCount: totalPages,
    visuals: updatedVisuals,
    columns: columns.value,
    wordsPerPage: adjustedWordsPerPage,
    lineHeight: lineHeight.value,
    margins: margins.value,
    isLocked: false,
    pages: [],
    // Add multiple timestamp flags to ensure changes are detected and broadcast
    _lastUpdated: Date.now(),
    _formUpdateTimestamp: Date.now(),
    _titleChanged: title.value !== props.article?.title,
    _broadcastTimestamp: Date.now(), // Ensure broadcasting happens
  }

  console.log('[ArticleForm] Submitting article update:', {
    id: props.article?.id,
    title: title.value,
    previousTitle: props.article?.title,
    titleChanged: title.value !== props.article?.title,
  })

  // Emit the add event with the article data
  emit('add', articleData)
}

function handleRandomArticleByType(type: 'regular' | 'cover' | 'full-page') {
  const random = generateRandomArticle(availableTags.value, type)
  title.value = random.title
  url.value = random.url
  tags.value = random.tags
  wordCount.value = random.wordCount.toString()
  columns.value = random.columns
  lineHeight.value = random.lineHeight
  visuals.value = random.visuals.map(v => ({ ...v, id: Math.random().toString(36).substring(2, 9) }))
  useWordCount.value = true
}

function handleTitleChange(newTitle: string) {
  title.value = newTitle
}

function handleUrlChange(newUrl: string) {
  url.value = newUrl
}

function handleTagsChange(newTags: Tag[]) {
  tags.value = newTags
}

function handleUseWordCountChange(value: boolean) {
  useWordCount.value = value
}

function handleWordCountChange(value: string) {
  wordCount.value = value
}

function handlePageCountChange(value: string) {
  pageCount.value = value
}

function handleLineHeightChange(value: LineHeight) {
  lineHeight.value = value
}

function handleColumnsChange(value: 1 | 2 | 3) {
  columns.value = value
}

function handleMarginsChange(newMargins: typeof margins.value) {
  margins.value = newMargins
}

function handleAddVisual() {
  visuals.value.push({
    id: Math.random().toString(36).substring(2, 9),
    title: '',
    type: 'image',
    width: '1/2',
    height: '1/3',
    x: 0,
    y: 0,
    page: 1,
    spaceOccupied: 0,
    url: '',
  })
}

function handleUpdateVisual(index: number, field: keyof Visual, value: any) {
  const newVisuals = [...visuals.value]
  newVisuals[index] = { ...newVisuals[index], [field]: value }
  visuals.value = newVisuals
}

function handleRemoveVisual(index: number) {
  visuals.value = visuals.value.filter((_, i) => i !== index)
}

function handleDelete() {
  if (props.article?.id) {
    emit('delete', props.article.id)
  }
}
</script>

<template>
  <form class="space-y-6" @submit="handleSubmit">
    <BasicInfo
      :title="title"
      :tags="tags"
      :url="url"
      :is-editing="!!article"
      @title-change="handleTitleChange"
      @url-change="handleUrlChange"
      @tags-change="handleTagsChange"
    />

    <ContentLength
      :use-word-count="useWordCount"
      :word-count="wordCount"
      :page-count="pageCount"
      :line-height="lineHeight"
      :columns="columns"
      :margins="margins"
      @use-word-count-change="handleUseWordCountChange"
      @word-count-change="handleWordCountChange"
      @page-count-change="handlePageCountChange"
      @line-height-change="handleLineHeightChange"
      @columns-change="handleColumnsChange"
    />

    <MarginSettings
      :margins="margins"
      @margins-change="handleMarginsChange"
    />

    <Visuals
      :visuals="visuals"
      :page-count="parseInt(pageCount)"
      @add="handleAddVisual"
      @update="handleUpdateVisual"
      @remove="handleRemoveVisual"
    />

    <div class="flex justify-end space-x-3">
      <button
        v-if="article && article.id"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-red-300 shadow-xs text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        @click="handleDelete"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Delete Article
      </button>

      <div class="relative group">
        <div class="flex">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-r-0 border-gray-300 shadow-xs text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="handleRandomArticleByType('regular')"
          >
            <Wand2 class="w-4 h-4 mr-2" />
            Random Article
          </button>
          <button
            type="button"
            class="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 shadow-xs text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-5 w-5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Dropdown menu -->
        <div class="absolute bottom-full right-0 mb-2 w-48 transform transition-all duration-200 opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible">
          <div class="bg-white rounded-md shadow-lg py-1 border border-gray-200">
            <button
              type="button"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleRandomArticleByType('regular')"
            >
              Regular Article
            </button>
            <button
              type="button"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleRandomArticleByType('cover')"
            >
              Cover Page
            </button>
            <button
              type="button"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleRandomArticleByType('full-page')"
            >
              Full Page Image
            </button>
          </div>
          <div class="absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 bg-white border-r border-b border-gray-200" />
        </div>
      </div>

      <button
        type="submit"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusCircle class="w-4 h-4 mr-2" />
        {{ article ? 'Update Content' : 'Add Content' }}
      </button>
    </div>
  </form>
</template>
