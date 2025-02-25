<script setup lang="ts">
import { ArrowLeft, ArrowRight, History, Redo2, Trash2, Undo2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useMagazineStore } from '../store/magazineStore'
import { getSessionId } from '../utils/collaboration'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const magazineStore = useMagazineStore()
const showResetConfirm = ref(false)
const currentUserId = ref(getSessionId())

// Computed properties for undo/redo state
const canUndo = computed(() => magazineStore.history.past.length > 0)
const canRedo = computed(() => magazineStore.history.future.length > 0)
const currentIndex = ref(-1) // Track current position

function handleUndo() {
  magazineStore.undo()
}

function handleRedo() {
  magazineStore.redo()
}

function handleJumpToHistory(index: number) {
  magazineStore.jumpToHistory(index)
  currentIndex.value = index
}

function handleReset() {
  magazineStore.resetState()
  showResetConfirm.value = false
}

function isCurrentUser(userId: string) {
  return userId === currentUserId.value
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-y-0 right-0 w-80 bg-white shadow-lg overflow-y-auto">
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-lg font-medium text-gray-900">
          History
        </h2>
        <div class="flex space-x-2">
          <button
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            :disabled="!canUndo"
            @click="handleUndo"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Undo
          </button>
          <button
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            :disabled="!canRedo"
            @click="handleRedo"
          >
            <ArrowRight class="w-4 h-4 mr-2" />
            Redo
          </button>
        </div>
      </div>

      <div class="overflow-y-auto flex-1 p-4">
        <div v-if="magazineStore.history.past.length === 0" class="text-center text-gray-500 p-6">
          No actions recorded yet
        </div>

        <div class="space-y-3">
          <div
            v-for="(entry, index) in magazineStore.history.past"
            :key="index"
            class="p-3 rounded-md transition-colors"
            :class="{ 'bg-blue-50': currentIndex === index, 'border-l-4': entry.user, 'border-green-300': entry.user && isCurrentUser(entry.user.id) }"
            :style="entry.user ? { borderLeftColor: entry.user.animal.color } : {}"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div
                  v-if="entry.user"
                  class="w-6 h-6 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: entry.user.animal.color }"
                  :title="entry.user.animal.name + (isCurrentUser(entry.user.id) ? ' (You)' : '')"
                >
                  <span class="text-xs text-white font-medium">
                    {{ entry.user.animal.name.charAt(0) }}
                  </span>
                  <span
                    v-if="isCurrentUser(entry.user.id)"
                    class="absolute -bottom-1 -right-1 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700">{{ entry.description }}</span>
                  <span v-if="entry.user" class="text-xs text-gray-500">
                    {{ entry.user.animal.name }}
                    <span v-if="isCurrentUser(entry.user.id)"> (You)</span>
                  </span>
                </div>
              </div>
              <button
                v-if="currentIndex !== index"
                class="text-xs text-blue-600 hover:text-blue-800"
                @click="handleJumpToHistory(index)"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset confirmation dialog -->
      <div v-if="showResetConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md">
          <h3 class="text-lg font-medium text-gray-900">
            Confirm Reset
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to reset the magazine? This will remove all articles and cannot be undone.
          </p>
          <div class="mt-4 flex justify-end space-x-2">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showResetConfirm = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              @click="handleReset"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
