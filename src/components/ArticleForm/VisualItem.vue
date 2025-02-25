<script setup lang="ts">
import { computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import type { Visual, SizeRatio } from '../../types';
import { SIZE_RATIOS } from './constants';
import { ratioToPercent } from '../../utils/calculations';
import { inputStyles, selectStyles } from './styles';
import VisualUploader from '../VisualUploader.vue';

const props = defineProps<{
  visual: Visual;
  pageCount: number;
}>();

const emit = defineEmits<{
  (e: 'update', field: keyof Visual, value: any): void;
  (e: 'remove'): void;
}>();

const calculateSpaceOccupied = (width: SizeRatio, height: SizeRatio): number => {
  const widthPercent = ratioToPercent(width);
  const heightPercent = ratioToPercent(height);
  return (widthPercent * heightPercent) / 100;
};

const handleUpdate = (field: keyof Visual, value: any) => {
  emit('update', field, value);
};

const handleRemove = () => {
  emit('remove');
};

const handleWidthChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const newWidth = target.value as SizeRatio;
  const spaceOccupied = calculateSpaceOccupied(newWidth, props.visual.height);
  handleUpdate('width', newWidth);
  handleUpdate('spaceOccupied', spaceOccupied);
};

const handleHeightChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const newHeight = target.value as SizeRatio;
  const spaceOccupied = calculateSpaceOccupied(props.visual.width, newHeight);
  handleUpdate('height', newHeight);
  handleUpdate('spaceOccupied', spaceOccupied);
};

const handlePageChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  handleUpdate('page', parseInt(target.value));
};

const handleTitleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  handleUpdate('title', target.value);
};

const handleTypeChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  handleUpdate('type', target.value);
};

const handleUpload = (url: string) => {
  handleUpdate('url', url);
};

const handleUploadError = (error: string) => {
  console.error(error);
};
</script>

<template>
  <div class="grid grid-cols-6 gap-4 items-end border-b pb-4">
    <div class="col-span-2">
      <label class="block text-sm font-medium text-gray-500">Title</label>
      <input
        type="text"
        :value="visual.title"
        @input="handleTitleChange"
        placeholder="Visual title"
        :class="inputStyles"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-500">Type</label>
      <select
        :value="visual.type"
        @change="handleTypeChange"
        :class="selectStyles"
      >
        <option value="image">Image</option>
        <option value="illustration">Illustration</option>
      </select>
    </div>

    <div v-if="pageCount > 1">
      <label class="block text-sm font-medium text-gray-500">
        Page
      </label>
      <select
        :value="visual.page"
        @change="handlePageChange"
        :class="selectStyles"
      >
        <option v-for="num in pageCount" :key="num" :value="num">
          Page {{ num }}
        </option>
      </select>
    </div>

    <div :class="pageCount > 1 ? 'col-span-1' : 'col-span-2'">
      <label class="block text-sm font-medium text-gray-500">Size</label>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Width</label>
          <select
            :value="visual.width"
            @change="handleWidthChange"
            :class="selectStyles"
          >
            <option v-for="ratio in SIZE_RATIOS" :key="ratio" :value="ratio">
              {{ ratio === 'full' ? 'Full width' : `${ratio} width` }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Height</label>
          <select
            :value="visual.height"
            @change="handleHeightChange"
            :class="selectStyles"
          >
            <option v-for="ratio in SIZE_RATIOS" :key="ratio" :value="ratio">
              {{ ratio === 'full' ? 'Full height' : `${ratio} height` }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex space-x-2">
      <VisualUploader
        :visual="visual"
        @upload="handleUpload"
        @error="handleUploadError"
      />
      <button
        type="button"
        @click="handleRemove"
        class="inline-flex items-center justify-center text-red-600 hover:text-red-800"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>
  </div>
</template> 
