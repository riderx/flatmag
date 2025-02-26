<script setup lang="ts">
import { Eye, PencilLine, Users2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { getConnectedUsers, isCollaborating as getIsCollaborating, getSessionId, joinSession } from '../utils/collaboration'
import UserPresence from './UserPresence.vue'

const { isSharing, isEditingAllowed = true, shareId } = defineProps<{
  isSharing: boolean
  isEditingAllowed?: boolean
  shareId?: string | null
}>()

const connectedUsers = ref(getConnectedUsers())
const currentUserId = ref(getSessionId())
const isCollaborating = ref(getIsCollaborating())

// Update users periodically
let userUpdateInterval: number | null = null

onMounted(() => {
  if (isSharing && shareId) {
    // Initial fetch of connected users
    const initialUsers = getConnectedUsers()
    console.log('[CollaborationStatus] Initial fetch of connected users:', initialUsers)
    connectedUsers.value = initialUsers
    console.log('[CollaborationStatus] Initial users after setting:', connectedUsers.value)

    // Set up periodic updates of connected users
    userUpdateInterval = window.setInterval(() => {
      const users = getConnectedUsers()
      console.log('[CollaborationStatus] Interval update - raw users from getConnectedUsers():', users)

      // Compare with current users
      const currentIds = connectedUsers.value.map(u => u.id).sort().join(',')
      const newIds = users.map(u => u.id).sort().join(',')

      if (currentIds !== newIds) {
        console.log('[CollaborationStatus] Users changed from previous update, updating UI')
        connectedUsers.value = users
      }

      isCollaborating.value = getIsCollaborating()
    }, 1000) // Update more frequently for responsive UI
  }

  return () => {
    if (userUpdateInterval) {
      clearInterval(userUpdateInterval)
    }
  }
})

// Watch for changes in editing permission
watch(() => isEditingAllowed, (newVal) => {
  console.log('Edit permission changed:', newVal)

  if (isSharing && shareId) {
    // Refresh the connected users to ensure UI is updated
    connectedUsers.value = getConnectedUsers()
    isCollaborating.value = getIsCollaborating()
  }
})

// Watch for changes in sharing status
watch(() => isSharing, (newVal) => {
  if (newVal && shareId) {
    // Re-join session when sharing status changes
    joinSession(shareId, isEditingAllowed)

    // Set up interval if not already set
    if (!userUpdateInterval) {
      userUpdateInterval = window.setInterval(() => {
        connectedUsers.value = getConnectedUsers()
        isCollaborating.value = getIsCollaborating()
      }, 1000) // Update more frequently
    }
  }
  else {
    // Clear interval if no longer sharing
    if (userUpdateInterval) {
      clearInterval(userUpdateInterval)
      userUpdateInterval = null
    }
  }
})
</script>

<template>
  <div v-if="isSharing" class="flex items-center space-x-3 p-2">
    <div :class="`flex items-center rounded-full ${isEditingAllowed ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`">
      <span class="relative flex h-3 w-3 mr-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span class="text-sm font-medium">{{ isEditingAllowed ? 'Collaborative Editing' : 'View Only' }}</span>
    </div>

    <UserPresence
      :users="connectedUsers"
      :current-user-id="currentUserId"
    />
  </div>
</template>
