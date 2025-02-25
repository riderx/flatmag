<script setup lang="ts">
import { History, Book, LayoutGrid, LayoutList, Settings } from 'lucide-vue-next';
import Share from '../Share/Share.vue';

const props = withDefaults(defineProps<{
  showList?: boolean;
}>(), {
  showList: true
});

const emit = defineEmits<{
  (e: 'historyClick'): void;
  (e: 'flipbookClick'): void;
  (e: 'viewToggle'): void;
  (e: 'settingsClick'): void;
}>();
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      @click="$emit('historyClick')"
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
    >
      <History class="w-4 h-4 mr-2" />
      History
    </button>
    
    <button
      @click="$emit('flipbookClick')"
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
    >
      <Book class="w-4 h-4 mr-2" />
      Flipbook
    </button>
    
    <button
      @click="$emit('settingsClick')"
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
    >
      <Settings class="w-4 h-4 mr-2" />
      Settings
    </button>

    <Share />

    <div class="w-px h-6 bg-gray-300 mx-2"></div>

    <button
      @click="$emit('viewToggle')"
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
