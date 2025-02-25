<script setup lang="ts">
import type { Tag } from '../../types'
import TagInput from '../TagInput.vue'
import { inputStyles } from './styles'

defineProps<{
  title: string
  url: string
  tags: Tag[]
  isEditing: boolean
}>()

const emit = defineEmits<{
  (e: 'titleChange', title: string): void
  (e: 'urlChange', url: string): void
  (e: 'tagsChange', tags: Tag[]): void
}>()

function handleTitleChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('titleChange', target.value)
}

function handleUrlChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('urlChange', target.value)
}

function handleTagsChange(tags: Tag[]) {
  emit('tagsChange', tags)
}
</script>

<template>
  <h2 class="text-2xl font-bold text-gray-900 mb-6">
    {{ isEditing ? 'Edit Content' : 'Add New Content' }}
  </h2>
  <div class="space-y-6">
    <div>
      <label for="title" class="block text-lg font-medium text-gray-700 mb-2">
        Content Title
      </label>
      <input
        id="title"
        type="text"
        :value="title"
        :class="`${inputStyles} text-xl`"
        required
        @input="handleTitleChange"
      >
    </div>

    <div>
      <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
        Content URL (optional)
      </label>
      <input
        id="url"
        type="url"
        :value="url"
        :class="inputStyles"
        placeholder="https://example.com"
        @input="handleUrlChange"
      >
    </div>

    <div class="mt-4">
      <TagInput
        :selected-tags="tags"
        @tags-change="handleTagsChange"
      />
      <div class="mt-2 flex items-center">
        <div class="text-xs text-gray-500">
          <span class="font-medium">Tip:</span> You can add magazine-specific tags or use global tags
        </div>
      </div>
    </div>
  </div>
</template>
