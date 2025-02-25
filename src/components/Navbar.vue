<script setup lang="ts">
import { Layout } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConnectedUsers, getSessionId } from '../utils/collaboration'
import UserPresence from './UserPresence.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isEditor = computed(() => route.path.startsWith('/flat-plan'))
const isMagazines = computed(() => route.path === '/magazines')
const currentUserId = getSessionId()
const connectedUsers = getConnectedUsers()
</script>

<template>
  <nav :class="`${isHome ? 'absolute w-full z-50' : 'bg-white shadow-xs'} py-4 mb-0`">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between space-x-4">
        <RouterLink to="/" class="flex items-center space-x-3">
          <Layout :class="`w-8 h-8 ${isHome ? 'text-white' : 'text-blue-600'}`" />
          <span :class="`text-xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}`">
            FlatMag
          </span>
        </RouterLink>

        <UserPresence
          v-if="!isHome"
          :users="connectedUsers"
          :current-user-id="currentUserId"
        />

        <div v-if="!isHome" class="flex items-center space-x-4">
          <RouterLink
            v-if="isEditor"
            to="/magazines"
            class="text-gray-600 hover:text-gray-900"
          >
            Back to Magazines
          </RouterLink>

          <RouterLink
            v-if="isMagazines"
            to="/"
            class="text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
