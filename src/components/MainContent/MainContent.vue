<script setup lang="ts">
import ArticleList from '../ArticleList.vue'
import FlipbookView from '../Flipbook/FlipbookView.vue'
import MagazineView from '../MagazineView.vue'

// Define props
withDefaults(defineProps<{
  showList?: boolean
  showFlipbook?: boolean
  articles?: any[]
  pages?: number
  zoomLevel?: any
  isEditingAllowed?: boolean
}>(), {
  showList: true,
  showFlipbook: false,
  articles: () => [],
  pages: 4,
  zoomLevel: '2',
  isEditingAllowed: true,
})

// Define emits
const emit = defineEmits<{
  (e: 'addPage'): void
  (e: 'removePage'): void
  (e: 'editArticle', article: any): void
  (e: 'updateArticle', article: any): void
  (e: 'deleteArticle', id: string): void
  (e: 'flipbookClose'): void
}>()

// Event handlers that emit events to parent
const handleAddPage = () => emit('addPage')
const handleRemovePage = () => emit('removePage')
const handleEditArticle = (article: any) => emit('editArticle', article)
const handleUpdateArticle = (article: any) => emit('updateArticle', article)
const handleDeleteArticle = (id: string) => emit('deleteArticle', id)
const handleFlipbookClose = () => emit('flipbookClose')
</script>

<template>
  <div class="relative">
    <!-- Article List View -->
    <template v-if="showList">
      <!-- Note: In the Vue version, we're not implementing DnD yet -->
      <ArticleList
        :articles="articles"
        :pages="pages"
        :is-editing-allowed="isEditingAllowed"
        @delete="handleDeleteArticle"
        @edit="handleEditArticle"
      />
    </template>

    <!-- Magazine View -->
    <template v-else>
      <MagazineView
        :articles="articles"
        :pages="pages"
        :zoom-level="zoomLevel"
        :is-editing-allowed="isEditingAllowed"
        @add-page="handleAddPage"
        @remove-page="handleRemovePage"
        @edit-article="handleEditArticle"
        @update-article="handleUpdateArticle"
      />
    </template>

    <!-- Flipbook View (shown as overlay when active) -->
    <FlipbookView
      v-if="showFlipbook"
      :articles="articles"
      :pages="pages"
      @close="handleFlipbookClose"
      @edit-article="handleEditArticle"
      @update-article="handleUpdateArticle"
    />
  </div>
</template>
