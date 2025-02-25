<script setup lang="ts">
import { Check, Share2, Users2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMagazineStore } from '../store/magazineStore'
import { initializeShare } from '../utils/share'
import CollaborationStatus from './CollaborationStatus.vue'
import Modal from './Modal.vue'

const copied = ref(false)
const showModal = ref(false)
const allowEdit = ref(true)
const isSharing = ref(false)
const route = useRoute()
const magazineStore = useMagazineStore()

const isCollaborating = computed(() => magazineStore.$state.isShared)
const shareId = computed(() => magazineStore.$state.shareId)

async function handleShare() {
  isSharing.value = true

  try {
    // Initialize sharing with the current magazine state
    const shareId = await initializeShare(allowEdit.value, magazineStore)

    // Update store to reflect the share status
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit: allowEdit.value,
      shareId,
    })

    // Generate the URL to share
    const url = `${window.location.origin}/share/${shareId}?edit=${allowEdit.value ? '1' : '0'}`

    // Copy the URL to clipboard
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)

    showModal.value = false
  }
  catch (error) {
    console.error('Failed to share magazine:', error)
  }
  finally {
    isSharing.value = false
  }
}
</script>

<template>
  <div v-if="route.path.includes('/flat-plan')">
    <div class="flex items-center space-x-3">
      <!-- Share Button -->
      <button
        v-if="!isCollaborating"
        class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        @click="showModal = true"
      >
        <Share2 class="w-4 h-4 mr-2" />
        Share
      </button>

      <!-- Collaboration Status -->
      <CollaborationStatus
        v-if="isCollaborating"
        :is-sharing="isCollaborating"
        :is-editing-allowed="magazineStore.$state.allowEdit"
        :share-id="shareId"
      />

      <!-- Share Again Button -->
      <button
        v-if="isCollaborating"
        class="inline-flex items-center px-3 py-2 text-xs border rounded-md font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
        @click="showModal = true"
      >
        <Share2 class="w-3 h-3 mr-1" />
        Re-share
      </button>
    </div>

    <Modal :is-open="showModal" @close="showModal = false">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900">
            Share Layout
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Choose how you want to share your magazine layout
          </p>
          <div v-if="isCollaborating" class="mt-2 bg-blue-50 p-3 rounded-md">
            <div class="flex items-center text-sm text-blue-700">
              <Users2 class="w-4 h-4 mr-2" />
              <span>This magazine is already being shared. Creating a new share link will not affect current collaborators.</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <label class="flex items-center space-x-3">
            <input
              v-model="allowEdit"
              type="checkbox"
              class="h-4 w-4 text-blue-600 rounded-sm border-gray-300"
            >
            <span class="text-sm text-gray-700">Allow editing</span>
          </label>

          <div v-if="allowEdit" class="bg-blue-50 p-4 rounded-md">
            <div class="flex items-center text-sm text-blue-700">
              <Users2 class="w-4 h-4 mr-2" />
              Recipients will be able to edit and collaborate on the layout
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="isSharing"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
            @click="handleShare"
          >
            <template v-if="copied">
              <Check class="w-4 h-4 mr-2" />
              Copied!
            </template>
            <template v-else-if="isSharing">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sharing...
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
