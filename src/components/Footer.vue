<script setup lang="ts">
import { ref } from 'vue';
import { Layout, Twitter, Github, Linkedin } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

const currentYear = ref(new Date().getFullYear());
</script>

<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <Layout class="w-8 h-8 text-blue-400" />
            <span class="text-xl font-bold">FlatMag</span>
          </div>
          <p class="text-gray-400 max-w-md">
            Transform your magazine planning process with our intuitive flat plan editor.
            Save time, reduce errors, and collaborate seamlessly.
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider mb-4">Product</h3>
          <ul class="space-y-3">
            <li>
              <RouterLink to="/flat-plan" class="text-gray-400 hover:text-white">
                Editor
              </RouterLink>
            </li>
            <li>
              <a href="#features" class="text-gray-400 hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" class="text-gray-400 hover:text-white">
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h3>
          <div class="flex space-x-4">
            <a href="https://twitter.com" class="text-gray-400 hover:text-white">
              <Twitter class="w-5 h-5" />
            </a>
            <a href="https://github.com" class="text-gray-400 hover:text-white">
              <Github class="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" class="text-gray-400 hover:text-white">
              <Linkedin class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>© {{ currentYear }} FlatMag. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template> 
