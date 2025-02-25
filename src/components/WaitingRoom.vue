<script setup lang="ts">
import { AlertTriangle, Layout, Loader } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

defineProps<{
  status: 'connecting' | 'waiting' | 'syncing' | 'error'
  error?: string
}>()

const router = useRouter()

function reloadPage() {
  window.location.reload()
}

function goToMagazines() {
  router.push('/magazines')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
      <template v-if="status === 'error'">
        <div class="flex justify-center">
          <AlertTriangle class="w-16 h-16 text-red-600" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">
            Connection Error
          </h2>
          <p class="text-gray-600">
            {{ error }}
          </p>
        </div>
        <div class="flex flex-col space-y-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="reloadPage"
          >
            Try Again
          </button>
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            @click="goToMagazines"
          >
            Back to Magazines
          </button>
        </div>
      </template>
      <template v-else>
        <div class="flex justify-center">
          <Layout class="w-16 h-16 text-blue-600" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">
            <template v-if="status === 'connecting'">
              Connecting to Session
            </template>
            <template v-else-if="status === 'waiting'">
              Waiting for Host
            </template>
            <template v-else-if="status === 'syncing'">
              Loading Magazine
            </template>
          </h2>
          <p class="text-gray-600">
            <template v-if="status === 'connecting'">
              Establishing connection...
            </template>
            <template v-else-if="status === 'waiting'">
              Waiting for host to accept...
            </template>
            <template v-else-if="status === 'syncing'">
              Syncing magazine data...
            </template>
          </p>
        </div>
        <div class="flex justify-center">
          <Loader class="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </template>
    </div>
  </div>
</template>
