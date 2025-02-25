<script setup lang="ts">
import { Settings } from 'lucide-vue-next';
import { useMagazineStore } from '../store/magazineStore';
import { pageRatios } from '../types';
import { watch } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const magazineStore = useMagazineStore();

// Save changes immediately when settings are updated
const handleSettingChange = () => {
  magazineStore.saveToLocalStorage();
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold flex items-center">
          <Settings class="w-6 h-6 mr-2" />
          Magazine Settings
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Magazine Title
          </label>
          <input
            type="text"
            v-model="magazineStore.title"
            @input="handleSettingChange"
            :disabled="magazineStore.isShared && !magazineStore.allowEdit"
            class="mt-1 block w-full rounded-md border border-gray-300 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Issue Number
          </label>
          <input
            type="text"
            v-model="magazineStore.issueNumber"
            @input="handleSettingChange"
            :disabled="magazineStore.isShared && !magazineStore.allowEdit"
            class="mt-1 block w-full rounded-md border border-gray-300 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Publication Date
          </label>
          <input
            type="date"
            v-model="magazineStore.publicationDate"
            @input="handleSettingChange"
            :disabled="magazineStore.isShared && !magazineStore.allowEdit"
            class="mt-1 block w-full rounded-md border border-gray-300 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Page Ratio
          </label>
          <select
            v-model="magazineStore.pageRatio"
            @change="handleSettingChange"
            :disabled="magazineStore.isShared && !magazineStore.allowEdit"
            class="mt-1 block w-full rounded-md border border-gray-300 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <option v-for="ratio in pageRatios" :key="ratio.value" :value="ratio.value">
              {{ ratio.name }} ({{ ratio.description }})
            </option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="$emit('close')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template> 
