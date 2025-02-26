<script setup lang="ts">
import { ArrowLeft, ArrowRight, Clock, History, RefreshCw } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useMagazineStore } from '../store/magazineStore'
import { getSessionId } from '../utils/collaboration'

const props = defineProps<{
  isOpen: boolean
}>()

// Define the emit for closing the panel
const emit = defineEmits<{
  (e: 'close'): void
}>()

const magazineStore = useMagazineStore()
const currentUserId = ref(getSessionId())
const restoredIndex = ref(-1)
const showRestoreSuccess = ref(false)

// Computed properties for undo/redo state
const canUndo = computed(() => magazineStore.history.past.length > 0)
const canRedo = computed(() => magazineStore.history.future.length > 0)

function handleUndo() {
  magazineStore.undo()
}

function handleRedo() {
  magazineStore.redo()
}

function handleJumpToHistory(index: number) {
  magazineStore.jumpToHistory(index)
  restoredIndex.value = index
  showRestoreSuccess.value = true

  // Auto-hide the success message after 2 seconds
  setTimeout(() => {
    showRestoreSuccess.value = false
  }, 2000)
}

function closePanel() {
  emit('close')
}

function isCurrentUser(userId: string) {
  return userId === currentUserId.value
}

function formatTime(timestamp: number | undefined): string {
  if (!timestamp)
    return ''

  // Format timestamp as HH:MM:SS
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

// Reset restoredIndex when panel is closed/opened
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    restoredIndex.value = -1
  }
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40">
    <!-- Transparent backdrop -->
    <div
      class="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
      @click="closePanel"
    />

    <!-- Panel -->
    <div class="absolute inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 overflow-hidden flex flex-col">
      <div class="h-full flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <History class="w-5 h-5 mr-2 text-blue-600" />
            History
          </h2>
          <div class="flex space-x-2">
            <button
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="!canUndo"
              title="Undo"
              @click="handleUndo"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <button
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="!canRedo"
              title="Redo"
              @click="handleRedo"
            >
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-1 p-4 space-y-2">
          <div
            v-if="magazineStore.history.past.length === 0"
            class="flex flex-col items-center justify-center h-full text-gray-500 p-6 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <Clock class="w-12 h-12 text-gray-300 mb-2" />
            <p class="text-sm">
              No history recorded yet
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Changes will appear here
            </p>
          </div>

          <div v-else class="space-y-2">
            <div class="text-xs text-gray-500 mb-1 flex items-center">
              <Clock class="w-3 h-3 mr-1" />
              History timeline
            </div>

            <div
              v-for="(entry, index) in magazineStore.history.past"
              :key="index"
              class="p-3 rounded-lg transition-all duration-200 border shadow-sm hover:shadow-md cursor-pointer group transform scale-100 hover:scale-[1.02]"
              :class="{
                'bg-blue-50 border-blue-200': restoredIndex === index,
                'bg-white border-gray-200': restoredIndex !== index,
              }"
              @click="handleJumpToHistory(index)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 flex-grow max-w-[80%] overflow-hidden">
                  <div
                    v-if="entry.user"
                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    :style="{ backgroundColor: entry.user.animal.color }"
                    :title="entry.user.animal.name + (isCurrentUser(entry.user.id) ? ' (You)' : '')"
                  >
                    <span class="text-xs text-white font-medium">
                      {{ entry.user.animal.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <History class="w-4 h-4 text-gray-500" />
                  </div>

                  <div class="flex flex-col min-w-0 overflow-hidden">
                    <span class="text-sm font-medium text-gray-900 truncate w-full block overflow-hidden text-ellipsis whitespace-nowrap">
                      {{ entry.description }}
                    </span>
                    <div class="flex items-center text-xs text-gray-500 truncate w-full overflow-hidden">
                      <span v-if="entry.user" class="truncate overflow-hidden text-ellipsis">
                        {{ entry.user.animal.name }}
                        <span v-if="isCurrentUser(entry.user.id)"> (You)</span>
                      </span>
                      <!-- Only show time if available -->
                      <span v-if="Date.now()" class="text-xs text-gray-400 ml-1 flex-shrink-0">
                        · {{ formatTime(Date.now()) }}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  v-if="restoredIndex !== index"
                  class="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0"
                >
                  <RefreshCw class="w-3 h-3 mr-1" />
                  Restore
                </button>
                <span
                  v-else
                  class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center flex-shrink-0"
                >
                  Current
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
