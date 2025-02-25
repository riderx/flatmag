<script setup lang="ts">
import { Sliders } from 'lucide-vue-next'
import { computed } from 'vue'
import { DEFAULT_MARGINS, MARGIN_STEP } from './constants'
import { inputStyles, selectStyles } from './styles'

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

const props = defineProps<{
  margins: Margins
}>()

const emit = defineEmits<{
  (e: 'marginsChange', margins: Margins): void
}>()

// Computed values for the sliders and inputs
const top = computed({
  get: () => props.margins.top,
  set: (value: number) => handleMarginChange('top', value),
})

const right = computed({
  get: () => props.margins.right,
  set: (value: number) => handleMarginChange('right', value),
})

const bottom = computed({
  get: () => props.margins.bottom,
  set: (value: number) => handleMarginChange('bottom', value),
})

const left = computed({
  get: () => props.margins.left,
  set: (value: number) => handleMarginChange('left', value),
})

function handleMarginChange(side: keyof Margins, value: number) {
  emit('marginsChange', {
    ...props.margins,
    [side]: value,
  })
}

function handleReset() {
  emit('marginsChange', { ...DEFAULT_MARGINS })
}
</script>

<template>
  <div>
    <div class="flex items-center mb-4">
      <Sliders class="mr-2 w-5 h-5 text-gray-600" />
      <h3 class="text-lg font-medium text-gray-700">
        Page Margins
      </h3>
      <div class="ml-auto">
        <button
          type="button"
          class="text-sm text-blue-600 hover:text-blue-800"
          @click="handleReset"
        >
          Reset to Default
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label for="marginTop" class="block text-sm font-medium text-gray-700">
          Top Margin ({{ top }}%)
        </label>
        <div class="mt-1 flex items-center">
          <input
            id="marginTop"
            v-model.number="top"
            type="range"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <input
            v-model.number="top"
            type="number"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="ml-2 w-16" :class="[inputStyles]"
          >
        </div>
      </div>

      <div>
        <label for="marginRight" class="block text-sm font-medium text-gray-700">
          Right Margin ({{ right }}%)
        </label>
        <div class="mt-1 flex items-center">
          <input
            id="marginRight"
            v-model.number="right"
            type="range"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <input
            v-model.number="right"
            type="number"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="ml-2 w-16" :class="[inputStyles]"
          >
        </div>
      </div>

      <div>
        <label for="marginBottom" class="block text-sm font-medium text-gray-700">
          Bottom Margin ({{ bottom }}%)
        </label>
        <div class="mt-1 flex items-center">
          <input
            id="marginBottom"
            v-model.number="bottom"
            type="range"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <input
            v-model.number="bottom"
            type="number"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="ml-2 w-16" :class="[inputStyles]"
          >
        </div>
      </div>

      <div>
        <label for="marginLeft" class="block text-sm font-medium text-gray-700">
          Left Margin ({{ left }}%)
        </label>
        <div class="mt-1 flex items-center">
          <input
            id="marginLeft"
            v-model.number="left"
            type="range"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <input
            v-model.number="left"
            type="number"
            :min="0"
            :max="20"
            :step="MARGIN_STEP"
            class="ml-2 w-16" :class="[inputStyles]"
          >
        </div>
      </div>
    </div>

    <div class="relative border-2 border-gray-200 p-3 rounded-lg">
      <div class="aspect-[1.414/1] bg-gray-100 rounded-md overflow-hidden">
        <!-- Visual representation of margins -->
        <div
          class="h-full w-full bg-white rounded"
          :style="{
            padding: `${top}% ${right}% ${bottom}% ${left}%`,
          }"
        >
          <div class="bg-blue-50 border border-blue-100 w-full h-full rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
