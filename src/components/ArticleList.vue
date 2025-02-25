<script setup lang="ts">
import type { Article } from '../types'
import { Edit, FileText, GripVertical, Plus, Trash2 } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useMagazineStore } from '../store/magazineStore'
import DeleteConfirmation from './DeleteConfirmation.vue'

const props = defineProps<{
  articles: Article[]
  pages: number
  isEditingAllowed: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'edit', article: Article): void
  (e: 'reorder', articles: Article[]): void
}>()

const magazineStore = useMagazineStore()
const sortedArticles = ref<Article[]>([...props.articles])
const articleToDelete = ref<{ id: string, title: string } | null>(null)

// Update sortedArticles when props.articles changes (shallow watch)
watch(() => props.articles, (newArticles) => {
  sortedArticles.value = [...newArticles]
}, { immediate: true })

// Deep watch to detect changes to article properties
watch(() => props.articles, (newArticles) => {
  // Get an updated version of each article while preserving order
  sortedArticles.value = sortedArticles.value.map((existingArticle) => {
    const updatedArticle = newArticles.find(a => a.id === existingArticle.id)
    return updatedArticle || existingArticle
  })

  // Add any new articles that might not be in sortedArticles
  const existingIds = new Set(sortedArticles.value.map(a => a.id))
  const newArticlesToAdd = newArticles.filter(a => !existingIds.has(a.id))
  if (newArticlesToAdd.length > 0) {
    sortedArticles.value = [...sortedArticles.value, ...newArticlesToAdd]
  }

  // Remove any articles that no longer exist in props.articles
  const validIds = new Set(newArticles.map(a => a.id))
  sortedArticles.value = sortedArticles.value.filter(a => validIds.has(a.id))
}, { deep: true, immediate: true })

function isLightColor(color: string) {
  const hex = color.replace('#', '')
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 128
}

function handleAddArticleClick() {
  const addButton = document.querySelector<HTMLButtonElement>('.add-article-button')
  if (addButton) {
    addButton.click()
  }
}

// Handle edit article
function handleEditArticle(article: Article) {
  emit('edit', article)
}

// Handle delete article
function handleDeleteArticle(article: Article) {
  // Show confirmation modal first
  articleToDelete.value = {
    id: article.id,
    title: article.title,
  }
}

// Confirm delete action
function confirmDelete() {
  if (!articleToDelete.value)
    return

  const id = articleToDelete.value.id

  // Emit delete event directly to parent component
  emit('delete', id)

  // Reset articleToDelete to close the modal
  articleToDelete.value = null
}

// Cancel delete action
function cancelDelete() {
  articleToDelete.value = null
}

// Handle drag start
function handleDragStart(e: DragEvent, article: Article) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', article.id)
    if (e.target instanceof HTMLElement) {
      e.target.classList.add('dragging')
    }
  }
}

// Handle drag over
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

// Handle drop
function handleDrop(e: DragEvent, targetArticle: Article) {
  e.preventDefault()
  if (e.dataTransfer) {
    const sourceId = e.dataTransfer.getData('text/plain')
    const sourceArticle = sortedArticles.value.find(article => article.id === sourceId)

    if (sourceArticle && sourceId !== targetArticle.id) {
      const newArticles = [...sortedArticles.value]
      const sourceIndex = newArticles.findIndex(article => article.id === sourceId)
      const targetIndex = newArticles.findIndex(article => article.id === targetArticle.id)

      // Remove the source article
      newArticles.splice(sourceIndex, 1)
      // Insert it at the target position
      newArticles.splice(targetIndex, 0, sourceArticle)

      // Update the startPage values for all articles
      let currentPage = 1
      const updatedArticles = newArticles.map((article) => {
        const updatedArticle = { ...article, startPage: currentPage }
        currentPage += article.pageCount
        return updatedArticle
      })

      // Update the local sorted articles
      sortedArticles.value = updatedArticles

      // Emit reorder event to update the magazine store
      emit('reorder', updatedArticles)
    }
  }

  // Remove dragging class from all elements
  document.querySelectorAll('.dragging').forEach((el) => {
    el.classList.remove('dragging')
  })
}

// Handle drag end
function handleDragEnd() {
  // Remove dragging class from all elements
  document.querySelectorAll('.dragging').forEach((el) => {
    el.classList.remove('dragging')
  })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ magazineStore.title }}
      </h2>
      <div class="text-sm text-gray-500">
        Issue {{ magazineStore.issueNumber }} • {{ new Date(magazineStore.publicationDate).toLocaleDateString() }}
      </div>
      <div class="mt-2 text-sm text-gray-600">
        {{ pages }} pages total
      </div>
    </div>

    <div v-if="sortedArticles.length === 0" class="text-center py-16 bg-white rounded-lg shadow-xs border-2 border-dashed border-gray-300">
      <FileText class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">
        No articles yet
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by adding your first article.
      </p>
      <button
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700"
        @click="handleAddArticleClick"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Article
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="article in sortedArticles"
        :key="article.id"
        draggable="true"
        class="p-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow duration-200"
        @dragstart="handleDragStart($event, article)"
        @dragover.prevent="handleDragOver($event)"
        @drop="handleDrop($event, article)"
        @dragend="handleDragEnd"
      >
        <div class="flex justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="text-gray-400">
              <GripVertical class="w-5 h-5" />
            </div>
            <h3 class="font-medium">
              <a
                v-if="article.url"
                :href="article.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {{ article.title }}
              </a>
              <span v-else class="text-gray-900">{{ article.title }}</span>
            </h3>
            <div class="flex gap-1">
              <span
                v-for="tag in article.tags"
                :key="tag.id"
                class="px-2 py-1 text-xs font-medium rounded-full"
                :style="{
                  backgroundColor: tag.color,
                  color: isLightColor(tag.color) ? 'black' : 'white',
                }"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="!isEditingAllowed"
              class="text-blue-600 hover:text-blue-800"
              @click="handleEditArticle(article)"
            >
              <Edit class="w-5 h-5" />
            </button>
            <button
              :disabled="!isEditingAllowed"
              class="text-red-600 hover:text-red-800"
              @click="handleDeleteArticle(article)"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
          <span>Pages {{ article.startPage }}–{{ article.startPage + article.pageCount - 1 }}</span>
          <span>{{ article.columns }} column{{ article.columns > 1 ? 's' : '' }}</span>
          <span v-if="article.wordCount > 0">{{ article.wordCount }} words</span>
          <span v-if="article.visuals.length > 0">
            {{ article.visuals.length }} visual{{ article.visuals.length > 1 ? 's' : '' }}
            <template v-if="article.visuals.some(v => v.title)">:
              {{ article.visuals.filter(v => v.title).map(v => v.title).join(', ') }}
            </template>
          </span>
        </div>

        <div class="flex gap-1">
          <div
            v-for="pageNum in Array.from(
              { length: article.pageCount },
              (_, i) => article.startPage + i,
            )"
            :key="pageNum"
            class="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          >
            {{ pageNum }}
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <DeleteConfirmation
      :title="articleToDelete?.title || ''"
      :is-open="!!articleToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.dragging {
  opacity: 0.5;
  border: 2px dashed #4f46e5;
}
</style>
