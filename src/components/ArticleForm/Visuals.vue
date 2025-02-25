<script setup lang="ts">
import type { Visual } from '../../types'
import { PlusCircle } from 'lucide-vue-next'
import VisualItem from './VisualItem.vue'

defineProps<{
  visuals: Visual[]
  pageCount: number
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'update', index: number, field: keyof Visual, value: any): void
  (e: 'remove', index: number): void
}>()

function handleAdd() {
  emit('add')
}

function handleUpdate(index: number, field: keyof Visual, value: any) {
  emit('update', index, field, value)
}

function handleRemove(index: number) {
  emit('remove', index)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <label class="block text-sm font-medium text-gray-700">
        Visuals (Images & Illustrations)
      </label>
      <button
        type="button"
        class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        @click="handleAdd"
      >
        <PlusCircle class="w-4 h-4 mr-2" />
        Add Visual
      </button>
    </div>

    <VisualItem
      v-for="(visual, index) in visuals"
      :key="visual.id"
      :visual="visual"
      :page-count="pageCount"
      @update="(field, value) => handleUpdate(index, field, value)"
      @remove="() => handleRemove(index)"
    />
  </div>
</template>
