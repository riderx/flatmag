<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  title: string
  isOpen: boolean
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
      <div class="flex items-start">
        <div class="shrink-0">
          <AlertTriangle class="w-6 h-6 text-red-600" />
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-gray-900">
            Delete Article
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete "{{ title }}"? This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <div class="flex justify-end mt-6 space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          @click="$emit('confirm')"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
