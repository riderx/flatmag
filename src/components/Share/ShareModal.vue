<script setup lang="ts">
import { computed } from 'vue';
import { X, Copy, Check, Users } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  allowEdit: boolean;
  copied: boolean;
  connectedUsers: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'share'): void;
  (e: 'allowEditChange', value: boolean): void;
}>();

const handleAllowEditChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('allowEditChange', target.checked);
};

const modalClass = computed(() => {
  return props.isOpen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
    : 'hidden';
});
</script>

<template>
  <div :class="modalClass">
    <div class="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Share</h2>
        <button
          @click="emit('close')"
          class="p-1 text-gray-500 rounded-full hover:bg-gray-100"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="mb-4">
        <div class="flex items-center mb-2">
          <Users class="w-4 h-4 mr-2 text-gray-500" />
          <span class="text-sm text-gray-500">{{ connectedUsers }} connected</span>
        </div>

        <div class="flex items-center">
          <input
            type="checkbox"
            id="allowEdit"
            :checked="allowEdit"
            @change="handleAllowEditChange"
            class="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="allowEdit" class="text-sm text-gray-700">
            Allow editing
          </label>
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="emit('share')"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          <template v-if="copied">
            <Check class="w-4 h-4 mr-2" />
            Copied!
          </template>
          <template v-else>
            <Copy class="w-4 h-4 mr-2" />
            Copy link
          </template>
        </button>
      </div>
    </div>
  </div>
</template> 
