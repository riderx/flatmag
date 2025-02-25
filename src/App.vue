<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Footer from './components/Footer.vue'
import Navbar from './components/Navbar.vue'
import { useMagazineStore } from './store/magazineStore'
import { setMagazineStoreInstance, setupStoreWatchers } from './store/mainStore'

const route = useRoute()
const magazineStore = useMagazineStore()

// Set the magazine store instance for non-component access
setMagazineStoreInstance(magazineStore)

// Initialize stores with data from localStorage
onMounted(() => {
  setupStoreWatchers()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <div class="flex-1">
      <RouterView />
    </div>
    <Footer v-if="route.meta.showFooter" />
  </div>
</template>
