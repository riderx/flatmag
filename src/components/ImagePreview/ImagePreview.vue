<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  className?: string;
  style?: Record<string, string>;
}>(), {
  className: '',
  style: () => ({})
});
</script>

<template>
  <div :class="`relative overflow-hidden ${className}`" :style="style">
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover rounded-sm pointer-events-none"
      :draggable="false"
      loading="lazy"
    />
  </div>
</template> 
