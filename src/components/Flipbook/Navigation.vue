<script setup lang="ts">
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

// Define props
const props = defineProps<{
  currentPage: number
  totalPages: number
  isFlipping: boolean
}>()

// Define emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'flip', direction: 'left' | 'right'): void
}>()

const handleClose = () => emit('close')
function handlePrevious() {
  if (props.currentPage > 0 && !props.isFlipping) {
    emit('flip', 'left')
  }
}

function handleNext() {
  if (props.currentPage < props.totalPages - 2 && !props.isFlipping) {
    emit('flip', 'right')
  }
}
</script>

<template>
  <button
    class="fixed top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 z-[60] p-2.5 rounded-full bg-black/50 hover:bg-black/60 transition-colors"
    @click="handleClose"
  >
    <X class="w-7 h-7" />
  </button>

  <button
    :disabled="currentPage <= 0 || isFlipping"
    class="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-[60]"
    @click="handlePrevious"
  >
    <ChevronLeft class="w-7 h-7 text-white" />
  </button>

  <button
    :disabled="currentPage >= totalPages - 2 || isFlipping"
    class="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-[60]"
    @click="handleNext"
  >
    <ChevronRight class="w-7 h-7 text-white" />
  </button>

  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/50 text-white text-sm md:text-base font-medium z-[60]">
    {{ currentPage + 1 }}-{{ currentPage + 2 }} of {{ totalPages }}
  </div>
</template>
