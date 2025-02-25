<script setup lang="ts">
import { Share2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useMagazineStore } from '../../store/magazineStore'
import { getConnectedUsers } from '../../utils/collaboration'
import { initializeShare } from '../../utils/share'
import ShareModal from './ShareModal.vue'

const showModal = ref(false)
const allowEdit = ref(true)
const copied = ref(false)
const sharePermission = ref(allowEdit.value ? 'edit' : 'read')
const connectedUsers = computed(() => getConnectedUsers())

const magazineStore = useMagazineStore()

function handleBroadcast() {
  if (allowEdit.value) {
    console.log('Broadcast started')
    // Logic to start broadcast
  }
  else {
    console.log('Broadcast stopped')
    // Logic to stop broadcast
  }
}

async function handleShare() {
  try {
    // Initialize share session
    const shareId = await initializeShare(allowEdit.value, magazineStore)

    // Generate share URL
    const shareUrl = new URL('/share', window.location.origin)
    shareUrl.searchParams.set('id', shareId)

    // Store permission in state
    sharePermission.value = allowEdit.value ? 'edit' : 'read'

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl.toString())
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)

    // Activate broadcast
    handleBroadcast()

    // Close modal
    showModal.value = false
  }
  catch (error) {
    console.error('Error sharing:', error)
  }
}

function handleAllowEditChange(value: boolean) {
  allowEdit.value = value
}
</script>

<template>
  <button
    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border rounded-md hover:bg-gray-50"
    @click="showModal = true"
  >
    <Share2 class="w-4 h-4 mr-2" />
    Share
  </button>

  <ShareModal
    :is-open="showModal"
    :allow-edit="allowEdit"
    :copied="copied"
    :connected-users="connectedUsers.length"
    @close="showModal = false"
    @share="handleShare"
    @allow-edit-change="handleAllowEditChange"
  />
</template>
