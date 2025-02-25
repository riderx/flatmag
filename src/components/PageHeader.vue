<script setup lang="ts">
import type { Article } from '../types'
import { Edit2, Lock, Settings2, Unlock } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  pageNumber: number
  article?: Article
  margins: { top: number, right: number, bottom: number, left: number }
  isEditingAllowed?: boolean
}>()

const emit = defineEmits<{
  (e: 'marginsChange', margins: { top: number, right: number, bottom: number, left: number }): void
  (e: 'editArticle', article: Article): void
  (e: 'updateArticle', article: Article): void
}>()

const showMarginSettings = ref(false)
const applyToAll = ref(false)
const applyToArticle = ref(false)

// Assuming these are in the magazineStore
const zoomLevel = ref('all') // This should come from the store
const showList = ref(false) // This should come from the store

function handleMarginChange(newMargins: typeof props.margins) {
  emit('marginsChange', newMargins)
  if (applyToAll.value) {
    // In Vue/Pinia, we'd call a store action instead of dispatching
    // magazineStore.updateAllMargins(newMargins);
  }
  else if (applyToArticle.value && props.article) {
    // magazineStore.updateArticleMargins({ articleId: props.article.id, margins: newMargins });
  }
}

function updateMargin(key: string, value: number) {
  const newMargins = { ...props.margins, [key]: value }
  handleMarginChange(newMargins)
}

function toggleArticleLock() {
  if (props.article) {
    emit('updateArticle', { ...props.article, isLocked: !props.article.isLocked })
  }
}

function handleApplyToAllChange() {
  if (applyToAll.value) {
    applyToArticle.value = false
  }
}

function handleApplyToArticleChange() {
  if (applyToArticle.value) {
    applyToAll.value = false
  }
}

function isLightColor(color: string) {
  const hex = color.replace('#', '')
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 128
}
</script>

<template>
  <div class="bg-white p-2 rounded-lg shadow-sm relative flex items-center justify-between min-h-[40px]">
    <div class="flex items-center space-x-3 min-w-0 flex-1">
      <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
        {{ pageNumber }}
      </div>
      <div v-if="article" class="flex items-center space-x-2 min-w-0 flex-1">
        <a
          v-if="article.url"
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-blue-600 truncate hover:text-blue-800 hover:underline"
          :title="article.title"
        >
          {{ article.title }}
        </a>
        <span
          v-else
          class="text-sm font-medium text-gray-900 truncate"
          :title="article.title"
        >
          {{ article.title }}
        </span>

        <div class="flex gap-1 shrink-0 ml-2 flex-nowrap">
          <div
            v-for="tag in article.tags"
            :key="tag.id"
            class="w-2 h-2 rounded-full cursor-help transition-all duration-300 ease-out group hover:scale-110 hover:w-auto hover:px-2 hover:h-5 hover:flex hover:items-center whitespace-nowrap"
            :style="{
              backgroundColor: tag.color,
              color: isLightColor(tag.color) ? 'black' : 'white',
            }"
            :title="tag.name"
          >
            <span class="hidden group-hover:inline text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="article && isEditingAllowed"
      class="flex items-center space-x-2 ml-2 shrink-0"
    >
      <!-- Edit button always visible -->
      <button
        class="p-1 text-blue-600 hover:text-blue-800"
        title="Edit article"
        @click="$emit('editArticle', article)"
      >
        <Edit2 class="w-4 h-4" />
      </button>

      <!-- Other settings only visible in certain zoom levels -->
      <template v-if="zoomLevel !== 'all'">
        <button
          class="p-1 text-gray-500 hover:text-gray-700"
          title="Adjust margins"
          @click="showMarginSettings = !showMarginSettings"
        >
          <Settings2 class="w-4 h-4" />
        </button>
        <button
          v-if="!article.visuals.some(v => v.width === 'full' && v.height === 'full') || showList"
          class="p-1 text-gray-500 hover:text-gray-700"
          :title="article.isLocked ? 'Unlock layout' : 'Lock layout'"
          @click="toggleArticleLock"
        >
          <Lock v-if="article.isLocked" class="w-4 h-4" />
          <Unlock v-else class="w-4 h-4" />
        </button>
      </template>
    </div>

    <div
      v-if="showMarginSettings"
      class="absolute bottom-full left-0 mb-2 z-10 bg-white rounded-lg shadow-lg p-4 space-y-3 min-w-[300px]"
    >
      <h3 class="font-medium text-gray-900">
        Page Margins
      </h3>
      <div class="space-y-2 mb-4">
        <div class="flex items-center space-x-2">
          <input
            id="applyToAll"
            v-model="applyToAll"
            type="checkbox"
            class="rounded-sm text-blue-600 focus:ring-blue-500"
            @change="handleApplyToAllChange"
          >
          <label for="applyToAll" class="text-sm text-gray-600">
            Apply to all pages
          </label>
        </div>
        <div v-if="article" class="flex items-center space-x-2">
          <input
            id="applyToArticle"
            v-model="applyToArticle"
            type="checkbox"
            class="rounded-sm text-blue-600 focus:ring-blue-500"
            @change="handleApplyToArticleChange"
          >
          <label for="applyToArticle" class="text-sm text-gray-600">
            Apply to all pages of "{{ article.title }}"
          </label>
        </div>
      </div>
      <div class="space-y-2">
        <div
          v-for="(value, key) in margins"
          :key="key"
          class="flex items-center justify-between"
        >
          <label class="text-sm text-gray-600 capitalize">
            {{ key }}:
          </label>
          <div class="flex items-center space-x-2 flex-1 ml-4">
            <input
              type="range"
              min="0"
              max="20"
              :value="value"
              class="flex-1"
              @input="updateMargin(key, parseInt(($event.target as HTMLInputElement).value))"
            >
            <span class="text-sm text-gray-600 w-8 text-right">{{ value }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
