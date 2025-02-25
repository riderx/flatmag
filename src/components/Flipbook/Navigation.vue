<script setup lang="ts">
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next';

// Define props
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  isFlipping: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'flip', direction: 'left' | 'right'): void;
}>();

const handleClose = () => emit('close');
const handlePrevious = () => {
  if (props.currentPage > 0 && !props.isFlipping) {
    emit('flip', 'left');
  }
};

const handleNext = () => {
  if (props.currentPage < props.totalPages - 2 && !props.isFlipping) {
    emit('flip', 'right');
  }
};
</script>

<template>
  <button
    @click="handleClose"
    class="absolute top-8 right-8 text-white hover:text-gray-300 z-50"
  >
    <X class="w-8 h-8" />
  </button>

  <button
    @click="handlePrevious"
    :disabled="currentPage <= 0 || isFlipping"
    class="absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50"
  >
    <ChevronLeft class="w-8 h-8 text-white" />
  </button>

  <button
    @click="handleNext"
    :disabled="currentPage >= totalPages - 2 || isFlipping"
    class="absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50"
  >
    <ChevronRight class="w-8 h-8 text-white" />
  </button>

  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/20 text-white text-lg z-50">
    {{ currentPage + 1 }}-{{ currentPage + 2 }} of {{ totalPages }}
  </div>
</template> 
