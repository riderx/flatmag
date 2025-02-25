<script setup lang="ts">
import { History, Redo2, Trash2, Undo2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useMagazineStore } from '../store/magazineStore'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const magazineStore = useMagazineStore()
const showResetConfirm = ref(false)
const resetConfirmStep = ref(0)

function handleUndo() {
  magazineStore.undo()
}

function handleRedo() {
  magazineStore.redo()
}

function handleJumpToHistory(index: number) {
  magazineStore.jumpToHistory(index)
}

function handleReset() {
  if (resetConfirmStep.value === 0) {
    showResetConfirm.value = true
    resetConfirmStep.value = 1
  }
  else if (resetConfirmStep.value === 1) {
    resetConfirmStep.value = 2
  }
  else {
    magazineStore.setConnectionStatus(false)
    magazineStore.resetState()
    localStorage.clear()
    showResetConfirm.value = false
    resetConfirmStep.value = 0
    window.location.reload()
  }
}

function closeResetConfirm() {
  showResetConfirm.value = false
  resetConfirmStep.value = 0
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 overflow-y-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center">
        <History class="w-5 h-5 mr-2" />
        History
      </h2>
      <div class="flex space-x-2">
        <button
          :disabled="magazineStore.history.past.length === 0"
          :class="`p-2 rounded ${
            magazineStore.history.past.length === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`"
          title="Undo (Ctrl+Z)"
          @click="handleUndo"
        >
          <Undo2 class="w-5 h-5" />
        </button>
        <button
          :disabled="magazineStore.history.future.length === 0"
          :class="`p-2 rounded ${
            magazineStore.history.future.length === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`"
          title="Redo (Ctrl+Y)"
          @click="handleRedo"
        >
          <Redo2 class="w-5 h-5" />
        </button>
        <button
          class="p-2 rounded-sm text-red-600 hover:bg-red-50"
          title="Reset All"
          @click="showResetConfirm = true"
        >
          <Trash2 class="w-5 h-5" />
        </button>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <button
        v-for="(entry, index) in magazineStore.history.past"
        :key="index"
        class="w-full text-left p-2 hover:bg-gray-100 rounded-sm"
        @click="handleJumpToHistory(index)"
      >
        <div class="text-sm font-medium">
          {{ entry.description }}
        </div>
        <div class="text-xs text-gray-500">
          {{ new Date().toLocaleTimeString() }}
        </div>
      </button>
      <div v-if="magazineStore.history.past.length === 0" class="text-center py-4 text-gray-500">
        No history yet
      </div>
    </div>

    <div v-if="showResetConfirm" class="absolute inset-0 bg-white p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-red-600">
          Reset Everything
        </h3>
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="closeResetConfirm"
        >
          ×
        </button>
      </div>

      <div class="text-sm text-gray-600">
        <template v-if="resetConfirmStep === 0">
          <p>Are you sure you want to reset everything? This will:</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>Delete all articles</li>
            <li>Clear all history</li>
            <li>Reset all settings</li>
            <li>Clear local storage</li>
          </ul>
          <p class="mt-2 font-medium">
            This action cannot be undone!
          </p>
        </template>
        <p v-else-if="resetConfirmStep === 1" class="font-medium">
          Click again to confirm reset.
        </p>
        <p v-else-if="resetConfirmStep === 2" class="font-medium text-red-600">
          Final warning: Click one more time to permanently delete everything.
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          class="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          @click="closeResetConfirm"
        >
          Cancel
        </button>
        <button
          :class="`px-3 py-2 text-sm font-medium rounded-md text-white ${
            resetConfirmStep === 2
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-600 hover:bg-gray-700'
          }`"
          @click="handleReset"
        >
          {{ resetConfirmStep === 0 ? 'Reset Everything' : 'Confirm Reset' }}
        </button>
      </div>
    </div>
  </div>
</template>
