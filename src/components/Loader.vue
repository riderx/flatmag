<script setup lang="ts">
import { Layout } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center justify-center space-x-3">
    <div class="relative w-16 h-16">
      <Layout class="w-16 h-16 text-blue-600 animate-pulse" />
      <div
        class="absolute inset-0 border-4 border-blue-600 rounded-lg animate-spin"
        style="animation-duration: 3s; border-right-color: transparent; border-bottom-color: transparent;"
      />
    </div>
  </div>
</template>
