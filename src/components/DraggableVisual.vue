<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getImageUrl } from '../utils/imageHandler';
import type { Visual, SizeRatio, Article } from '../types';
import { useMagazineStore } from '../store/magazineStore';

interface ImageLoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

const props = defineProps<{
  visual: Visual;
  isLocked: boolean;
  currentPage: number;
  article: Article;
}>();

const emit = defineEmits<{
  (e: 'updateArticle', article: Article): void;
}>();

const magazineStore = useMagazineStore();
const loadingState = ref<ImageLoadingState>({
  isLoading: false,
  error: null,
  retryCount: 0
});

const imageUrl = ref<string | null>(null);
const isDragDisabled = computed(() => props.isLocked);

// Create refs for draggable functionality
const nodeRef = ref<HTMLElement | null>(null);
const transform = ref({ x: 0, y: 0 });

// Create attributes and listeners for draggable
const attributes = {
  role: 'button',
  'aria-roledescription': 'draggable',
  tabIndex: 0
};

const listeners = {
  onPointerDown: (e: PointerEvent) => {
    if (isDragDisabled.value) return;
    // Handle pointer down event
    // This would normally be handled by the DnD library
  }
};

// Function to set the node ref
const setNodeRef = (element: HTMLElement | null) => {
  nodeRef.value = element;
};

// Watch for URL changes to load images
watch(() => props.visual.url, (newUrl) => {
  if (newUrl) {
    loadImage(newUrl);
  }
}, { immediate: true });

// Load image with retry logic
const loadImage = async (url: string) => {
  if (!url) return;
  
  loadingState.value.isLoading = true;
  loadingState.value.error = null;
  
  try {
    const imageUrl = await getImageUrl(url);
    if (imageUrl) {
      loadingState.value.isLoading = false;
      loadingState.value.retryCount = 0;
    } else {
      throw new Error('Failed to load image');
    }
  } catch (error) {
    loadingState.value.isLoading = false;
    loadingState.value.error = error instanceof Error ? error.message : 'Unknown error';
    
    // Retry logic
    if (loadingState.value.retryCount < 3) {
      loadingState.value.retryCount++;
      setTimeout(() => loadImage(url), 1000 * loadingState.value.retryCount);
    }
  }
};

// Convert size ratio to percentage
const sizeToPercent = (size: SizeRatio): number => {
  switch (size) {
    case 'full': return 100;
    case '1/2': return 50;
    case '1/3': return 33.33;
    case '1/4': return 25;
    case '1/6': return 16.67;
    case '1/8': return 12.5;
    case '1/10': return 10;
    default: return 50;
  }
};

// Computed styles for the visual
const visualStyle = computed(() => {
  const width = sizeToPercent(props.visual.width as SizeRatio);
  const height = sizeToPercent(props.visual.height as SizeRatio);
  
  return {
    width: `${width}%`,
    height: `${height}%`,
    left: `${props.visual.x}%`,
    top: `${props.visual.y}%`,
    transform: transform.value ? `translate3d(${transform.value.x}px, ${transform.value.y}px, 0)` : undefined,
    cursor: isDragDisabled.value ? 'default' : 'grab',
    zIndex: props.visual.width === 'full' && props.visual.height === 'full' ? 0 : 1
  };
});
</script>

<template>
  <div
    ref="setNodeRef"
    :style="visualStyle"
    class="absolute rounded-sm overflow-hidden"
    v-bind="attributes"
    v-on="listeners"
  >
    <img
      v-if="visual.type === 'image' && visual.url"
      :src="visual.url"
      :alt="visual.title || 'Visual'"
      class="w-full h-full object-cover"
      draggable="false"
    />
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
