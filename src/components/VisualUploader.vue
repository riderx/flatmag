<script setup lang="ts">
import type { Visual } from '../types'
import { Upload } from 'lucide-vue-next'
import { ref } from 'vue'
import { handleImageUpload } from '../utils/imageHandler'

defineProps<{
  visual: Partial<Visual>
}>()

const emit = defineEmits<{
  (e: 'upload', url: string): void
  (e: 'error', error: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handleUpload() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  const result = await handleImageUpload(file)
  if (result.error || !result.base64) {
    emit('error', result.error)
  }
  else {
    emit('upload', result.base64)
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/*"
      @change="handleFileChange"
    >
    <button
      type="button"
      class="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
      title="Upload Image"
      @click="handleUpload"
    >
      <Upload class="w-5 h-5" />
    </button>
  </div>
</template>
