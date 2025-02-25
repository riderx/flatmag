<script setup lang="ts">
import { ref, computed } from 'vue';
import { DndContext, DragEndEvent, PointerSensor } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { ratioToPercent } from '../utils/calculations';
import TextLines from './TextLines.vue';
import DraggableVisual from './DraggableVisual.vue';
import { calculatePageAvailableSpace } from '../utils/calculations';
import { validateVisualPosition } from '../utils/imageHandler';
import type { Article } from '../types';

const props = withDefaults(defineProps<{
  article: Article;
  pageIndex: number;
  isFlipbook?: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  isEditingAllowed: boolean;
}>(), {
  isFlipbook: false
});

const emit = defineEmits<{
  (e: 'editArticle', article: Article): void;
  (e: 'updateArticle', article: Article): void;
}>();

// Create a sensor configuration object instead of using React hooks
const sensors = [{
  sensor: PointerSensor,
  options: {
    activationConstraint: {
      distance: 8,
    },
  }
}];

const isFullPage = (article: Article): boolean => {
  return article.visuals.some(v => 
    v.width === 'full' && v.height === 'full' && v.page === article.startPage
  );
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, delta } = event;
  if (!active || props.article.isLocked || !props.isEditingAllowed) return;

  const container = document.getElementById(`article-${props.article.id}-page-${props.pageIndex}`);
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const currentPageValue = props.pageIndex + 1;
  const visual = props.article.visuals.find(v => v.id === active.id);
  
  if (!visual) return;

  const deltaX = (delta.x / rect.width) * 100;
  const deltaY = (delta.y / rect.height) * 100;
  const newPosition = validateVisualPosition(
    {
      ...visual,
      x: visual.x + deltaX,
      y: visual.y + deltaY
    },
    rect.width,
    rect.height
  );

  if (currentPageValue >= props.article.startPage && currentPageValue <= props.article.startPage + props.article.pageCount - 1) {
    const updatedVisuals = props.article.visuals.map(v =>
      v.id === active.id ? { 
        ...v, 
        ...newPosition,
        page: currentPageValue
      } : v
    );

    const updatedPages = props.article.pages.map(page => {
      const pageVisuals = updatedVisuals.filter(v => v.page === page.pageNumber);
      return {
        ...page,
        visuals: pageVisuals,
        availableSpace: calculatePageAvailableSpace(pageVisuals)
      };
    });

    emit('updateArticle', { 
      ...props.article, 
      visuals: updatedVisuals,
      pages: updatedPages
    });
  }
};

const currentPage = computed(() => props.pageIndex + 1);
const page = computed(() => props.article.pages.find(p => p.pageNumber === currentPage.value));

const isCurrentPageFull = computed(() => props.article.visuals.some(v => 
  v.width === 'full' && v.height === 'full' && v.page === currentPage.value
));

const visualsOnCurrentPage = computed(() => 
  props.article.visuals.filter(v => v.page === currentPage.value)
);
</script>

<template>
  <DndContext
    :sensors="sensors"
    :modifiers="isFlipbook ? [] : [restrictToParentElement]"
    @drag-end="handleDragEnd"
  >
    <div
      :id="`article-${article.id}-page-${pageIndex}`"
      class="relative h-full rounded-sm overflow-hidden"
      :style="{
        padding: `${margins.top}% ${margins.right}% ${margins.bottom}% ${margins.left}%`
      }"
    >
      <div class="h-full relative">
        <TextLines
          v-if="!isCurrentPageFull && page"
          :wordCount="page.wordCount"
          :availableSpace="page.availableSpace"
          :columns="article.columns"
          :lineHeight="article.lineHeight"
          :margins="margins"
          :visuals="page ? page.visuals : []"
        />
        <DraggableVisual
          v-for="visual in visualsOnCurrentPage"
          :key="visual.id"
          :visual="visual"
          :isLocked="article.isLocked || isFlipbook"
          :currentPage="currentPage"
          :article="article"
          @update-article="$emit('updateArticle', $event)"
        />
      </div>
    </div>
  </DndContext>
</template> 
