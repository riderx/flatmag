<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useMagazineStore } from './store/magazineStore';
import { setupStoreWatchers, setMagazineStoreInstance } from './store/mainStore';

const route = useRoute();
const magazineStore = useMagazineStore();

// Set the magazine store instance for non-component access
setMagazineStoreInstance(magazineStore);

// Initialize stores with data from localStorage
onMounted(() => {
  setupStoreWatchers();
});
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
