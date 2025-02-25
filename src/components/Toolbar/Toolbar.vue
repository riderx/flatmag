<script setup lang="ts">
import { Book, History, LayoutGrid, LayoutList, Settings } from 'lucide-vue-next'
import Share from '../Share/Share.vue'

withDefaults(defineProps<{
  showList?: boolean
}>(), {
  showList: true,
})

defineEmits<{
  (e: 'historyClick'): void
  (e: 'flipbookClick'): void
  (e: 'viewToggle'): void
  (e: 'settingsClick'): void
}>()
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      @click="$emit('historyClick')"
    >
      <History class="w-4 h-4 mr-2" />
      History
    </button>

    <button
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      @click="$emit('flipbookClick')"
    >
      <Book class="w-4 h-4 mr-2" />
      Flipbook
    </button>

    <button
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      @click="$emit('settingsClick')"
    >
      <Settings class="w-4 h-4 mr-2" />
      Settings
    </button>

    <Share />

    <div class="w-px h-6 bg-gray-300 mx-2" />

    <button
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      @click="$emit('viewToggle')"
    >
      <template v-if="showList">
        <LayoutGrid class="w-4 h-4 mr-2" />
        Show Grid
      </template>
      <template v-else>
        <LayoutList class="w-4 h-4 mr-2" />
        Show List
      </template>
    </button>
  </div>
</template>
