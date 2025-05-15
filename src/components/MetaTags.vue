<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  image?: string
  url?: string
  keywords?: string
  author?: string
  themeColor?: string
  canonical?: string
  robots?: string
  locale?: string
  type?: string
}>(), {
  title: 'FlatPlan - Magazine Planning, Simplified',
  description: 'Transform your editorial workflow with our intuitive flat plan editor. Plan, collaborate, and publish with confidence.',
  image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&h=630',
  url: window.location.href,
  keywords: 'magazine planning, editorial workflow, flat plan editor, publishing',
  author: 'FlatPlan',
  themeColor: '#ffffff',
  canonical: window.location.href,
  robots: 'index, follow',
  locale: 'en_US',
  type: 'website',
})

const siteName = 'FlatPlan'

// Store original title to restore on unmount
const originalTitle = document.title

// Meta tags that we'll create and need to clean up
const metaTags: HTMLMetaElement[] = []

// Function to create or update meta tags
function updateMetaTags() {
  // Clean up any previously created tags
  metaTags.forEach((tag) => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag)
    }
  })
  metaTags.length = 0

  // Set document title
  document.title = props.title

  // Helper function to create or update meta tags
  const createMetaTag = (name: string, content: string, property?: string) => {
    const meta = document.createElement('meta')
    if (name)
      meta.setAttribute('name', name)
    if (property)
      meta.setAttribute('property', property)
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
    metaTags.push(meta)
  }

  // Create canonical link
  const canonical = document.createElement('link')
  canonical.setAttribute('rel', 'canonical')
  canonical.setAttribute('href', props.canonical)
  document.head.appendChild(canonical)
  metaTags.push(canonical as unknown as HTMLMetaElement)

  // Basic meta tags
  createMetaTag('description', props.description)
  createMetaTag('keywords', props.keywords)
  createMetaTag('author', props.author)
  createMetaTag('robots', props.robots)
  createMetaTag('theme-color', props.themeColor)

  // Open Graph tags
  createMetaTag('', props.title, 'og:title')
  createMetaTag('', props.description, 'og:description')
  createMetaTag('', props.image, 'og:image')
  createMetaTag('', props.url, 'og:url')
  createMetaTag('', props.type, 'og:type')
  createMetaTag('', siteName, 'og:site_name')
  createMetaTag('', props.locale, 'og:locale')

  // Article specific OG tags if type is article
  if (props.type === 'article') {
    createMetaTag('', props.author, 'article:author')
    createMetaTag('', new Date().toISOString(), 'article:published_time')
  }

  // Twitter Card tags
  createMetaTag('twitter:card', 'summary_large_image')
  createMetaTag('twitter:title', props.title)
  createMetaTag('twitter:description', props.description)
  createMetaTag('twitter:image', props.image)
  createMetaTag('twitter:site', '@flatplan')
  createMetaTag('twitter:creator', '@flatplan')

  // PWA Meta Tags
  createMetaTag('application-name', siteName)
  createMetaTag('apple-mobile-web-app-capable', 'yes')
  createMetaTag('apple-mobile-web-app-status-bar-style', 'default')
  createMetaTag('apple-mobile-web-app-title', siteName)
  createMetaTag('format-detection', 'telephone=no')
  createMetaTag('mobile-web-app-capable', 'yes')
  createMetaTag('msapplication-TileColor', props.themeColor)
  createMetaTag('msapplication-tap-highlight', 'no')

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': props.type === 'article' ? 'Article' : 'WebSite',
    'name': props.title,
    'description': props.description,
    'url': props.url,
    'image': props.image,
    'author': {
      '@type': 'Organization',
      'name': props.author,
    },
  }

  const scriptTag = document.createElement('script')
  scriptTag.setAttribute('type', 'application/ld+json')
  scriptTag.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(scriptTag)
  metaTags.push(scriptTag as unknown as HTMLMetaElement)
}

// Update meta tags when component mounts
onMounted(() => {
  updateMetaTags()
})

// Watch for changes in props
watch(() => [
  props.title,
  props.description,
  props.image,
  props.url,
  props.keywords,
  props.author,
  props.themeColor,
  props.canonical,
  props.robots,
  props.locale,
  props.type,
], () => {
  updateMetaTags()
})

// Clean up meta tags when component unmounts
onUnmounted(() => {
  metaTags.forEach((tag) => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag)
    }
  })
  document.title = originalTitle
})
</script>
