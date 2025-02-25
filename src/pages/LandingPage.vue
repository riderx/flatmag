<script setup lang="ts">
import { ref } from 'vue';
import { useMeta } from 'vue-meta';
import { ChevronRight, Layout, Users, Clock, Zap, Layers, Share2, CheckCircle, Star, FileText, PenTool } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

useMeta({
  title: 'FlatMag - Modern Magazine Flat Planning Tool',
  meta: [
    {
      name: 'description',
      content: 'FlatMag is a modern magazine flat planning tool for publishers and editors.'
    }
  ]
});

const testimonials = ref([
  {
    name: 'Sarah Johnson',
    role: 'Editor-in-Chief, Style Magazine',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    content: 'FlatPlan has revolutionized our editorial planning process. What used to take days now takes hours.'
  },
  {
    name: 'Michael Chen',
    role: 'Art Director, Tech Weekly',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    content: 'The visual layout tools are incredible. It\'s like having a digital art board that the whole team can access.'
  },
  {
    name: 'Emma Davis',
    role: 'Managing Editor, Lifestyle Quarterly',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    content: 'The collaboration features have made remote work with our global team seamless and efficient.'
  }
]);

const brands = ref([
  {
    name: 'The Telegraph',
    logo: '/logos/telegraph.svg'
  },
  {
    name: 'Lufthansa',
    logo: '/logos/lufthansa.svg'
  },
  {
    name: 'Cosmopolitan',
    logo: '/logos/cosmopolitan.jpg'
  },
  {
    name: 'The London Standard',
    logo: '/logos/tls.webp'
  }
]);

const features = ref([
  {
    icon: FileText,
    title: 'Smart Layout Planning',
    description: 'Intelligent page distribution and automatic content flow',
    examples: [
      'Automatic page number calculation based on content',
      'Smart visual placement with collision detection',
      'Dynamic word count distribution across pages'
    ]
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time peer-to-peer collaboration without servers',
    examples: [
      'Instant article updates across all connected editors',
      'Visual indicators for concurrent editing',
      'No server required - works directly between browsers'
    ]
  },
  {
    icon: PenTool,
    title: 'Advanced Content Management',
    description: 'Comprehensive tools for content organization',
    examples: [
      'Tag-based content organization and filtering',
      'Visual size ratio management for images',
      'Multi-column layout support with dynamic text flow'
    ]
  },
  {
    icon: Share2,
    title: 'Seamless Sharing',
    description: 'Multiple ways to share and preview your work',
    examples: [
      'Interactive flipbook preview mode',
      'Shareable URLs with complete layout state',
      'Export capabilities for stakeholder review'
    ]
  }
]);

const comparisons = ref([
  {
    traditional: 'Manual layout planning with spreadsheets',
    flatplan: 'Visual drag-and-drop interface'
  },
  {
    traditional: 'Time-consuming email updates',
    flatplan: 'Real-time collaboration'
  },
  {
    traditional: 'Scattered content across tools',
    flatplan: 'Centralized content hub'
  },
  {
    traditional: 'Complex revision process',
    flatplan: 'One-click updates and history'
  }
]);
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden text-white bg-blue-600">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-6 text-4xl font-bold md:text-6xl">
            Magazine Planning,
            <span class="text-blue-200">Simplified</span>
          </h1>
          <p class="max-w-3xl mx-auto mb-8 text-xl text-blue-100 md:text-2xl">
            Transform your editorial workflow with our intuitive flat plan editor.
            Plan, collaborate, and publish with confidence.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <RouterLink 
              to="/magazines" 
              class="inline-flex items-center px-6 py-3 font-medium text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50"
            >
              Try Now
              <ChevronRight class="w-5 h-5 ml-2" />
            </RouterLink>
            <a 
              href="#features" 
              class="inline-flex items-center px-6 py-3 font-medium text-white transition-colors border-2 border-white rounded-lg hover:bg-white hover:text-blue-600"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted By Section -->
    <section class="py-24 bg-gradient-to-b from-white to-gray-50">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Trusted by Industry Leaders
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Join the world's most innovative publications and media companies
          </p>
        </div>
        <div class="grid items-center grid-cols-2 gap-12 md:grid-cols-4">
          <div
            v-for="brand in brands"
            :key="brand.name"
            class="relative flex items-center justify-center p-8 transition-all duration-300 transform bg-white group aspect-[3/2] rounded-2xl hover:scale-105 hover:shadow-xl"
          >
            <div class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-blue-50 to-transparent group-hover:opacity-100 rounded-2xl"></div>
            <img
              :src="brand.logo"
              :alt="brand.name"
              :class="`relative max-h-16 w-auto object-contain transition-all duration-500 ${
                brand.name === 'The London Standard'
                  ? 'brightness-0 opacity-40 group-hover:opacity-80'
                  : 'filter grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0'
              }`"
            />
          </div>
        </div>
        <p class="mt-12 text-lg text-center text-gray-600">
          Join over <span class="font-semibold text-blue-600">2,000+</span> publications worldwide
        </p>
      </div>
    </section>
    
    <!-- Features Section -->
    <section id="features" class="py-20">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-4xl font-bold text-gray-900">
            Everything you need to create the perfect flat plan
          </h2>
          <p class="max-w-2xl mx-auto text-xl text-gray-600">
            Powerful features designed to streamline your magazine planning process
          </p>
        </div>
        <div class="grid gap-8 md:grid-cols-2">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-8 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
          >
            <div class="flex items-center justify-center mb-6 text-blue-600 bg-blue-100 w-14 h-14 rounded-xl">
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900">
              {{ feature.title }}
            </h3>
            <p class="mb-6 text-gray-600">{{ feature.description }}</p>
            <div class="space-y-3">
              <div v-for="(example, index) in feature.examples" :key="index" class="flex items-start">
                <CheckCircle class="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <span class="text-gray-700">{{ example }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Feature Demo Section -->
        <div class="mt-20">
          <h3 class="mb-8 text-2xl font-bold text-center text-gray-900">
            See It In Action
          </h3>
          <div class="grid gap-12 md:grid-cols-2">
            <div class="p-6 bg-white shadow-lg rounded-xl">
              <h4 class="mb-4 text-lg font-semibold">Real-time Collaboration Demo</h4>
              <div class="mb-4 overflow-hidden bg-gray-100 rounded-lg aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&h=450"
                  alt="Real-time collaboration"
                  class="object-cover w-full h-full"
                />
              </div>
              <p class="text-gray-600">
                Work together in real-time with your team using our peer-to-peer collaboration feature.
                Changes sync instantly across all connected editors.
              </p>
            </div>
            <div class="p-6 bg-white shadow-lg rounded-xl">
              <h4 class="mb-4 text-lg font-semibold">Smart Layout System</h4>
              <div class="mb-4 overflow-hidden bg-gray-100 rounded-lg aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&h=450"
                  alt="Smart layout system"
                  class="object-cover w-full h-full"
                />
              </div>
              <p class="text-gray-600">
                Our intelligent layout system automatically handles page distribution, content flow,
                and visual placement while maintaining perfect balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Section -->
    <section class="py-20 bg-gray-50">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Why Choose FlatPlan?
          </h2>
          <p class="text-xl text-gray-600">
            See how FlatPlan transforms your workflow
          </p>
        </div>
        <div class="grid gap-8 md:grid-cols-2">
          <div class="p-8 bg-white shadow-xs rounded-xl">
            <h3 class="mb-6 text-xl font-semibold text-red-600">
              Traditional Method
            </h3>
            <ul class="space-y-4">
              <li
                v-for="item in comparisons"
                :key="item.traditional"
                class="flex items-start text-gray-600"
              >
                <span class="mr-3 text-red-500">✕</span>
                {{ item.traditional }}
              </li>
            </ul>
          </div>
          <div class="p-8 bg-white shadow-xs rounded-xl">
            <h3 class="mb-6 text-xl font-semibold text-green-600">
              With FlatPlan
            </h3>
            <ul class="space-y-4">
              <li
                v-for="item in comparisons"
                :key="item.flatplan"
                class="flex items-start text-gray-600"
              >
                <CheckCircle class="w-5 h-5 mr-3 text-green-500 shrink-0" />
                {{ item.flatplan }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Loved by editorial teams worldwide
          </h2>
          <p class="text-xl text-gray-600">
            See what our customers have to say
          </p>
        </div>
        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="p-8 bg-white shadow-xs rounded-xl"
          >
            <div class="flex items-center mb-6">
              <img
                :src="testimonial.image"
                :alt="testimonial.name"
                class="object-cover w-12 h-12 rounded-full"
              />
              <div class="ml-4">
                <h4 class="font-medium text-gray-900">
                  {{ testimonial.name }}
                </h4>
                <p class="text-sm text-gray-600">{{ testimonial.role }}</p>
              </div>
            </div>
            <p class="text-gray-600">{{ testimonial.content }}</p>
            <div class="flex mt-4 text-yellow-400">
              <Star v-for="i in 5" :key="i" class="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 bg-gray-50">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p class="text-xl text-gray-600">
            No subscriptions, no hidden fees
          </p>
        </div>
        <div class="max-w-lg mx-auto">
          <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
            <div class="p-8 text-center text-white bg-blue-600">
              <h3 class="mb-2 text-2xl font-bold">Lifetime Access</h3>
              <div class="mb-4 text-5xl font-bold">€99</div>
              <p class="text-blue-100">One-time payment, forever access</p>
            </div>
            <div class="p-8">
              <ul class="space-y-4">
                <li 
                  v-for="feature in [
                    'Unlimited magazines',
                    'All premium features',
                    'Free updates forever',
                    'Priority support',
                    'No recurring fees'
                  ]" 
                  :key="feature" 
                  class="flex items-center text-gray-600"
                >
                  <CheckCircle class="w-5 h-5 mr-3 text-green-500" />
                  {{ feature }}
                </li>
              </ul>
              <RouterLink
                to="/magazines"
                class="inline-flex items-center justify-center w-full px-6 py-3 mt-8 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Get Started Now
                <ChevronRight class="w-5 h-5 ml-2" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template> 
