<script setup lang="ts">
import { ref } from 'vue';
import ArticleList from '../ArticleList.vue';
import MagazineView from '../MagazineView.vue';
import FlipbookView from '../Flipbook/FlipbookView.vue';
import type { ZoomLevel } from '../../types';

// Define props
const props = withDefaults(defineProps<{
  showList?: boolean;
  showFlipbook?: boolean;
  articles?: any[];
  pages?: number;
  zoomLevel?: any;
  isEditingAllowed?: boolean;
}>(), {
  showList: true,
  showFlipbook: false,
  articles: () => [],
  pages: 4,
  zoomLevel: '2',
  isEditingAllowed: true
});

// Define emits
const emit = defineEmits<{
  (e: 'add-page'): void;
  (e: 'remove-page'): void;
  (e: 'edit-article', article: any): void;
  (e: 'update-article', article: any): void;
  (e: 'delete-article', id: string): void;
  (e: 'flipbook-close'): void;
  (e: 'drag-end', event: any): void;
}>();

// Handle drag end event (for sortable context)
const handleDragEnd = (event: any) => {
  emit('drag-end', event);
};

// Event handlers that emit events to parent
const handleAddPage = () => emit('add-page');
const handleRemovePage = () => emit('remove-page');
const handleEditArticle = (article: any) => emit('edit-article', article);
const handleUpdateArticle = (article: any) => emit('update-article', article);
const handleDeleteArticle = (id: string) => emit('delete-article', id);
const handleFlipbookClose = () => emit('flipbook-close');
</script>

<template>
  <div class="relative">
    <!-- Article List View -->
    <template v-if="showList">
      <!-- Note: In the Vue version, we're not implementing DnD yet -->
      <ArticleList
        :articles="articles"
        :pages="pages"
        :isEditingAllowed="isEditingAllowed"
        @delete="handleDeleteArticle"
        @edit="handleEditArticle"
      />
    </template>
    
    <!-- Magazine View -->
    <template v-else>
      <MagazineView
        :articles="articles"
        :pages="pages"
        :zoomLevel="zoomLevel"
        :isEditingAllowed="isEditingAllowed"
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
