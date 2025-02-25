<script setup lang="ts">
interface User {
  id: string
  animal: {
    name: string
    color: string
  }
}

interface UserPresenceProps {
  users: User[]
  currentUserId: string
}

defineProps<UserPresenceProps>()
</script>

<template>
  <div v-if="users.length > 1" class="flex items-center space-x-2">
    <div class="flex -space-x-2">
      <div
        v-for="user in users"
        :key="user.id"
        class="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white"
        :style="{ backgroundColor: user.animal.color }"
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
    </div>
    <span class="text-sm text-gray-600">
      {{ users.length }} active
    </span>
  </div>
</template>
