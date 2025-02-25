<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

interface DropdownOption {
  label: string
  onClick: () => void
}

withDefaults(defineProps<{
  options: DropdownOption[]
  buttonContent?: any
  className?: string
}>(), {
  className: '',
  buttonContent: null,
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)
let timeoutId: number | null = null

onUnmounted(() => {
  if (timeoutId) {
    window.clearTimeout(timeoutId)
  }
})

function handleMouseLeave() {
  timeoutId = window.setTimeout(() => {
    isOpen.value = false
  }, 300) // Delay before closing
}

function handleMouseEnter() {
  if (timeoutId) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
  isOpen.value = true
}

function handleOptionClick(option: DropdownOption) {
  option.onClick()
  isOpen.value = false
}
</script>

<template>
  <div
    ref="dropdownRef"
    :class="`relative ${className}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="flex">
      <slot />
    </div>

    <div
      :class="`absolute bottom-full right-0 mb-2 w-48 transform transition-all duration-200 ${
        isOpen
          ? 'opacity-100 translate-y-0 visible'
          : 'opacity-0 translate-y-1 invisible'
      }`"
    >
      <div class="bg-white rounded-md shadow-lg py-1 border border-gray-200">
        <button
          v-for="(option, index) in options"
          :key="index"
          type="button"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="handleOptionClick(option)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 bg-white border-r border-b border-gray-200" />
    </div>
  </div>
</template>
