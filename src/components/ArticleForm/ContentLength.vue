<script setup lang="ts">
import { computed } from 'vue';
import type { LineHeight } from '../../types';
import { LINE_HEIGHTS } from './constants';
import { inputStyles, selectStyles } from './styles';
import { calculateWordsPerPage } from '../../utils/calculations';

const props = defineProps<{
  useWordCount: boolean;
  wordCount: string;
  pageCount: string;
  lineHeight: LineHeight;
  columns: 1 | 2 | 3;
}>();

const emit = defineEmits<{
  (e: 'useWordCountChange', useWordCount: boolean): void;
  (e: 'wordCountChange', wordCount: string): void;
  (e: 'pageCountChange', pageCount: string): void;
  (e: 'lineHeightChange', lineHeight: LineHeight): void;
  (e: 'columnsChange', columns: 1 | 2 | 3): void;
}>();

// Calculate words per page based on current settings
const wordsPerPage = computed(() => {
  // Base calculation from the utility function
  const baseWordsPerPage = 600; // This matches the React implementation
  
  // Extract the ratio from the lineHeight string (e.g., "1/50" -> 50)
  const ratio = parseInt(props.lineHeight.split('/')[1]);
  
  // Calculate words per page based on line height and columns
  return baseWordsPerPage * props.columns;
});

// Calculate required pages based on word count
const calculatedPages = computed(() => {
  const words = parseInt(props.wordCount) || 0;
  return Math.max(1, Math.ceil(words / wordsPerPage.value));
});

const handleUseWordCountChange = (value: boolean) => {
  emit('useWordCountChange', value);
};

const handleWordCountChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('wordCountChange', target.value);
};

const handlePageCountChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('pageCountChange', target.value);
};

const handleLineHeightChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('lineHeightChange', target.value as LineHeight);
};

const handleColumnsChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('columnsChange', parseInt(target.value) as 1 | 2 | 3);
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-4">
      <label class="text-sm font-medium text-gray-700">Content Length:</label>
      <div class="flex items-center space-x-2">
        <input
          type="radio"
          id="useWords"
          :checked="useWordCount"
          @change="handleUseWordCountChange(true)"
          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
        />
        <label for="useWords" class="text-sm text-gray-700">Word Count</label>
      </div>
      <div class="flex items-center space-x-2">
        <input
          type="radio"
          id="usePages"
          :checked="!useWordCount"
          @change="handleUseWordCountChange(false)"
          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
        />
        <label for="usePages" class="text-sm text-gray-700">Page Count</label>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div v-if="useWordCount">
        <label for="wordCount" class="block text-sm font-medium text-gray-700">
          Word Count
        </label>
        <input
          type="number"
          id="wordCount"
          :value="wordCount"
          @input="handleWordCountChange"
          :class="inputStyles"
          min="0"
        />
        <p class="mt-1 text-sm text-gray-500">
          Will take approximately {{ calculatedPages }} 
          pages({{ wordsPerPage }} words per page)
        </p>
      </div>
      <div v-else>
        <label for="pageCount" class="block text-sm font-medium text-gray-700">
          Number of Pages
        </label>
        <input
          type="number"
          id="pageCount"
          :value="pageCount"
          @input="handlePageCountChange"
          :class="inputStyles"
          min="1"
        />
        <p class="mt-1 text-sm text-gray-500">
          Can fit approximately {{ wordsPerPage }} words per page
        </p>
      </div>

      <div>
        <label for="lineHeight" class="block text-sm font-medium text-gray-700">
          Line Height
        </label>
        <select
          id="lineHeight"
          :value="lineHeight"
          @change="handleLineHeightChange"
          :class="selectStyles"
        >
          <option v-for="height in LINE_HEIGHTS" :key="height" :value="height">
            {{ height }} of page
          </option>
        </select>
      </div>

      <div>
        <label for="columns" class="block text-sm font-medium text-gray-700">
          Number of Columns
        </label>
        <select
          id="columns"
          :value="columns"
          @change="handleColumnsChange"
          :class="selectStyles"
        >
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </div>
    </div>
  </div>
</template> 
