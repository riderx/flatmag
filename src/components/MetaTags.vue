<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}>(), {
  title: 'FlatPlan - Magazine Planning, Simplified',
  description: 'Transform your editorial workflow with our intuitive flat plan editor. Plan, collaborate, and publish with confidence.',
  image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&h=630',
  url: window.location.href
});

const siteName = 'FlatPlan';

// Store original title to restore on unmount
const originalTitle = document.title;

// Meta tags that we'll create and need to clean up
const metaTags: HTMLMetaElement[] = [];

// Function to create or update meta tags
const updateMetaTags = () => {
  // Clean up any previously created tags
  metaTags.forEach(tag => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag);
    }
  });
  metaTags.length = 0;

  // Set document title
  document.title = props.title;

  // Helper function to create or update meta tags
  const createMetaTag = (name: string, content: string, property?: string) => {
    const meta = document.createElement('meta');
    if (name) meta.setAttribute('name', name);
    if (property) meta.setAttribute('property', property);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
    metaTags.push(meta);
  };

  // Create meta tags
  createMetaTag('description', props.description);
  
  // Open Graph tags
  createMetaTag('', props.title, 'og:title');
  createMetaTag('', props.description, 'og:description');
  createMetaTag('', props.image, 'og:image');
  createMetaTag('', props.url, 'og:url');
  createMetaTag('', 'website', 'og:type');
  createMetaTag('', siteName, 'og:site_name');
  
  // Twitter Card tags
  createMetaTag('twitter:card', 'summary_large_image');
  createMetaTag('twitter:title', props.title);
  createMetaTag('twitter:description', props.description);
  createMetaTag('twitter:image', props.image);
  
  // PWA Meta Tags
  createMetaTag('application-name', siteName);
  createMetaTag('apple-mobile-web-app-capable', 'yes');
  createMetaTag('apple-mobile-web-app-status-bar-style', 'default');
  createMetaTag('apple-mobile-web-app-title', siteName);
  createMetaTag('format-detection', 'telephone=no');
};

// Update meta tags when component mounts
onMounted(() => {
  updateMetaTags();
});

// Watch for changes in props
watch(() => [props.title, props.description, props.image, props.url], () => {
  updateMetaTags();
});

// Clean up meta tags when component unmounts
onUnmounted(() => {
  metaTags.forEach(tag => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag);
    }
  });
  document.title = originalTitle;
});
</script>

<template>
  <!-- This component doesn't render anything -->
</template> 
