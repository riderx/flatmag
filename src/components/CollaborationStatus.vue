<script setup lang="ts">
import { Users } from 'lucide-vue-next'

withDefaults(defineProps<{
  isCollaborating: boolean
  peersCount: number
  isEditingAllowed?: boolean
}>(), {
  isEditingAllowed: true,
})
</script>

<template>
  <div v-if="isCollaborating" class="flex items-center space-x-2 text-sm">
    <div class="flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700">
      <Users class="w-4 h-4 mr-2" />
      <span>{{ peersCount }} connected</span>
    </div>
    <div v-if="!isEditingAllowed" class="px-3 py-1 rounded-full bg-gray-50 text-gray-700">
      View Only
    </div>
  </div>
</template>
