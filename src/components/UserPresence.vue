<script setup lang="ts">
import type { User } from '../utils/collaboration'
import { User as LucideUser } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface UserPresenceProps {
  users: User[]
  currentUserId: string
}

const props = defineProps<UserPresenceProps>()
const showUserList = ref(false)
const listRef = ref<HTMLElement | null>(null)

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

const sortedUsers = computed(() => {
  // Put current user first, then sort others alphabetically
  return [...props.users].sort((a, b) => {
    if (a.id === props.currentUserId)
      return -1
    if (b.id === props.currentUserId)
      return 1
    return a.animal.name.localeCompare(b.animal.name)
  })
})

const currentUser = computed(() => {
  return props.users.find(user => user.id === props.currentUserId)
})
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
          v-for="(user, index) in users.slice(0, 3)"
          :key="user.id"
          class="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white"
          :class="{ 'ring-green-300 ring-opacity-50': user.id === currentUserId }"
          :style="{ backgroundColor: user.animal.color, zIndex: users.length - index }"
          :title="`${user.animal.name}${user.id === currentUserId ? ' (You)' : ''}`"
        >
          <span class="text-xs font-medium text-white">
            {{ user.animal.name.charAt(0) }}
          </span>
          <span
            v-if="user.id === currentUserId"
            class="absolute -bottom-1 -right-1 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"
          />
        </div>
        <div
          v-if="users.length > 3"
          class="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white"
          :style="{ zIndex: 0 }"
        >
          <span class="text-xs font-medium text-gray-700">+{{ users.length - 3 }}</span>
        </div>
      </div>
      <span class="text-sm text-gray-600">
        {{ users.length }} {{ users.length === 1 ? 'user' : 'users' }}
      </span>
    </div>

    <!-- User list dropdown -->
    <div
      v-if="showUserList"
      ref="listRef"
      class="absolute top-10 right-0 z-10 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-3"
      @click.stop
    >
      <h3 class="font-medium text-gray-900 mb-3">
        Connected Users
      </h3>

      <!-- Current user highlight -->
      <div v-if="currentUser" class="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
        <div class="flex items-center space-x-3">
          <div
            class="inline-flex items-center justify-center w-10 h-10 rounded-full"
            :style="{ backgroundColor: currentUser.animal.color }"
          >
            <span class="text-sm font-medium text-white">{{ currentUser.animal.name.charAt(0) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium flex items-center">
              {{ currentUser.animal.name }}
              <span class="text-xs text-green-600 ml-2 px-2 py-0.5 bg-green-100 rounded-full">You</span>
            </span>
            <span class="text-xs text-gray-500">Your color in history</span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div v-if="users.length > 1" class="border-t border-gray-100 my-2 pt-2">
        <h4 class="text-xs font-medium text-gray-500 mb-2">
          Other Users
        </h4>
      </div>

      <ul class="space-y-2">
        <li
          v-for="user in sortedUsers.filter(u => u.id !== currentUserId)"
          :key="user.id"
          class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
        >
          <div
            class="inline-flex items-center justify-center w-8 h-8 rounded-full"
            :style="{ backgroundColor: user.animal.color }"
          >
            <span class="text-xs font-medium text-white">{{ user.animal.name.charAt(0) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ user.animal.name }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
