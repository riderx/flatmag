<script setup lang="ts">
import type { SizeRatio, Visual } from '../../types'
import { Trash2 } from 'lucide-vue-next'
import { ratioToPercent } from '../../utils/calculations'
import VisualUploader from '../VisualUploader.vue'
import { SIZE_RATIOS } from './constants'
import { inputStyles, selectStyles } from './styles'

const props = defineProps<{
  visual: Visual
  pageCount: number
}>()

const emit = defineEmits<{
  (e: 'update', field: keyof Visual, value: any): void
  (e: 'remove'): void
}>()

function calculateSpaceOccupied(width: SizeRatio, height: SizeRatio): number {
  const widthPercent = ratioToPercent(width)
  const heightPercent = ratioToPercent(height)
  return (widthPercent * heightPercent) / 100
}

function handleUpdate(field: keyof Visual, value: any) {
  emit('update', field, value)
}

function handleRemove() {
  emit('remove')
}

function handleWidthChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const newWidth = target.value as SizeRatio
  const spaceOccupied = calculateSpaceOccupied(newWidth, props.visual.height)
  handleUpdate('width', newWidth)
  handleUpdate('spaceOccupied', spaceOccupied)
}

function handleHeightChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const newHeight = target.value as SizeRatio
  const spaceOccupied = calculateSpaceOccupied(props.visual.width, newHeight)
  handleUpdate('height', newHeight)
  handleUpdate('spaceOccupied', spaceOccupied)
}

function handlePageChange(e: Event) {
  const target = e.target as HTMLSelectElement
  handleUpdate('page', Number.parseInt(target.value))
}

function handleTitleChange(e: Event) {
  const target = e.target as HTMLInputElement
  handleUpdate('title', target.value)
}

function handleTypeChange(e: Event) {
  const target = e.target as HTMLSelectElement
  handleUpdate('type', target.value)
}

function handleUpload(url: string) {
  handleUpdate('url', url)
}

function handleUploadError(error: string) {
  console.error(error)
}
</script>

<template>
  <div class="grid grid-cols-6 gap-4 items-end border-b pb-4">
    <div class="col-span-2">
      <label class="block text-sm font-medium text-gray-500">Title</label>
      <input
        type="text"
        :value="visual.title"
        placeholder="Visual title"
        :class="inputStyles"
        @input="handleTitleChange"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-500">Type</label>
      <select
        :value="visual.type"
        :class="selectStyles"
        @change="handleTypeChange"
      >
        <option value="image">
          Image
        </option>
        <option value="illustration">
          Illustration
        </option>
      </select>
    </div>

    <div v-if="pageCount > 1">
      <label class="block text-sm font-medium text-gray-500">
        Page
      </label>
      <select
        :value="visual.page"
        :class="selectStyles"
        @change="handlePageChange"
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
            :class="selectStyles"
            @change="handleWidthChange"
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
            :class="selectStyles"
            @change="handleHeightChange"
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
        class="inline-flex items-center justify-center text-red-600 hover:text-red-800"
        @click="handleRemove"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
