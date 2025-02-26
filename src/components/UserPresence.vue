<script setup lang="ts">
import type { User } from '../utils/collaboration'
import { User as LucideUser } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface UserPresenceProps {
  users: User[]
  currentUserId: string
}

const props = defineProps<UserPresenceProps>()
const showUserList = ref(false)
const listRef = ref<HTMLElement | null>(null)

// Make a reactive copy of users to avoid mutation issues
const usersList = ref<User[]>([])

// Update usersList when props.users changes
watch(() => props.users, (newUsers) => {
  console.log('[UserPresence] Received users update:', newUsers)
  usersList.value = [...newUsers]
  console.log('[UserPresence] User presence updated:', usersList.value.length, 'users')
}, { immediate: true, deep: true })

function toggleUserList() {
  showUserList.value = !showUserList.value
}

function closeUserList(event: MouseEvent) {
  if (listRef.value && !listRef.value.contains(event.target as Node)) {
    showUserList.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeUserList)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserList)
})

const MAX_DISPLAY = 3

const sortedUsers = computed(() => {
  // Sort users: current user first, then others
  return [...usersList.value].sort((a, b) => {
    if (a.id === props.currentUserId)
      return -1
    if (b.id === props.currentUserId)
      return 1
    return 0
  })
})

// Use MAX_DISPLAY in the template to limit visible users
const displayedUsers = computed(() => {
  return sortedUsers.value.slice(0, MAX_DISPLAY)
})

const hiddenUsersCount = computed(() => {
  return Math.max(0, sortedUsers.value.length - MAX_DISPLAY)
})

// Remove or comment out the unused currentUser computed property
// const currentUser = computed(() => {
//   return usersList.value.find(user => user.id === props.currentUserId)
// })
</script>

<template>
  <div v-if="users.length > 0" class="relative">
    <div
      class="flex items-center space-x-2 cursor-pointer"
      title="Click to see all users"
      @click.stop="toggleUserList"
    >
      <div class="flex -space-x-2">
        <div
          v-for="(user, index) in displayedUsers"
          :key="user.id"
          class="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white"
          :class="{ 'ring-green-300 ring-opacity-50': user.id === currentUserId }"
          :style="{ backgroundColor: user.animal.color, zIndex: users.length - index }"
          :title="`${user.animal.name}${user.id === currentUserId ? ' (You)' : ''}`"
        >
          <span class="text-lg font-medium text-white">
            {{ user.animal.name.charAt(0) }}
          </span>
          <span
            v-if="user.id === currentUserId"
            class="absolute -bottom-1 -right-1 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"
          />
        </div>
        <div
          v-if="hiddenUsersCount > 0"
          class="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white"
          :style="{ zIndex: 0 }"
        >
          <span class="text-xs font-medium text-gray-700">+{{ hiddenUsersCount }}</span>
        </div>
      </div>
      <span class="text-sm text-gray-600">
        {{ users.length }} {{ users.length === 1 ? 'user' : 'users' }}
      </span>
    </div>

    <!-- User list -->
    <div
      v-if="showUserList"
      ref="listRef"
      class="absolute top-full mt-2 right-0 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-10"
    >
      <h3 class="text-sm font-medium text-gray-700 mb-2">
        Connected users ({{ sortedUsers.length }})
      </h3>
      <ul class="space-y-2">
        <li
          v-for="user in sortedUsers"
          :key="user.id"
          class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-50"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white"
            :style="{ backgroundColor: user.animal.color }"
          >
            <span class="text-xs">{{ user.animal.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="text-sm">
            <div class="font-medium">
              {{ user.animal.name }}
              <span v-if="user.id === currentUserId" class="text-gray-500 text-xs">(you)</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
