<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Share2, Check, Users } from 'lucide-vue-next';
import { generateShareUrl } from '@src/utils/share';
import Modal from './Modal.vue';

const copied = ref(false);
const showModal = ref(false);
const allowEdit = ref(true);
const route = useRoute();

const handleShare = async () => {
  const url = generateShareUrl(allowEdit.value);
  showModal.value = false;

  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (error) {
    console.error('Failed to copy URL:', error);
    // Fallback for browsers that don't support clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  }
};
</script>

<template>
  <div v-if="route.path.includes('/flat-plan')">
    <button
      @click="showModal = true"
      class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <Share2 class="w-4 h-4 mr-2" />
      Share
    </button>

    <Modal :is-open="showModal" @close="showModal = false">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Share Layout</h3>
          <p class="mt-1 text-sm text-gray-500">
            Choose how you want to share your magazine layout
          </p>
        </div>

        <div class="space-y-4">
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="allowEdit"
              class="h-4 w-4 text-blue-600 rounded-sm border-gray-300"
            />
            <span class="text-sm text-gray-700">Allow editing</span>
          </label>

          <div v-if="allowEdit" class="bg-blue-50 p-4 rounded-md">
            <div class="flex items-center text-sm text-blue-700">
              <Users class="w-4 h-4 mr-2" />
              Recipients will be able to edit and collaborate on the layout
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            @click="handleShare"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <template v-if="copied">
              <Check class="w-4 h-4 mr-2" />
              Copied!
            </template>
            <template v-else>
              Copy Share Link
            </template>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template> 
