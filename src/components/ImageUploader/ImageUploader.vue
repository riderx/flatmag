<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
import { ref } from 'vue'
import { handleImageUpload } from '../../utils/imageHandler/index'

withDefaults(defineProps<{
  className?: string
}>(), {
  className: '',
})

const emit = defineEmits<{
  (e: 'upload', base64: string): void
  (e: 'error', error: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

function handleUploadClick() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  isUploading.value = true
  try {
    const result = await handleImageUpload(file)
    if (result.error || !result.base64) {
      emit('error', result.error || 'Failed to upload image')
    }
    else {
      emit('upload', result.base64)
    }
  }
  finally {
    isUploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
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
      :disabled="isUploading"
      :class="`inline-flex items-center justify-center text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`"
      title="Upload Image"
      @click="handleUploadClick"
    >
      <Upload :class="`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`" />
    </button>
  </div>
</template>
