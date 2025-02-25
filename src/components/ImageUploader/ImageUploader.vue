<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';
import { handleImageUpload } from '../../utils/imageHandler';

const props = withDefaults(defineProps<{
  className?: string;
}>(), {
  className: ''
});

const emit = defineEmits<{
  (e: 'upload', base64: string): void;
  (e: 'error', error: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const handleUploadClick = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  try {
    const result = await handleImageUpload(file);
    if (result.error || !result.base64) {
      emit('error', result.error || 'Failed to upload image');
    } else {
      emit('upload', result.base64);
    }
  } finally {
    isUploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
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
      @click="handleUploadClick"
      :disabled="isUploading"
      :class="`inline-flex items-center justify-center text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`"
      title="Upload Image"
    >
      <Upload :class="`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`" />
    </button>
  </div>
</template> 
