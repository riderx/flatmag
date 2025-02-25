<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';
import { handleImageUpload } from '../utils/imageHandler';
import type { Visual } from '../types';

defineProps<{
  visual: Partial<Visual>;
}>();

const emit = defineEmits<{
  (e: 'upload', url: string): void;
  (e: 'error', error: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const handleUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const result = await handleImageUpload(file);
  if (result.error || !result.base64) {
    emit('error', result.error);
  } else {
    emit('upload', result.base64);
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<template>
  <div>
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/*"
      @change="handleFileChange"
    />
    <button
      type="button"
      @click="handleUpload"
      class="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
      title="Upload Image"
    >
      <Upload class="w-5 h-5" />
    </button>
  </div>
</template> 
