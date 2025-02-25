<script setup lang="ts">
import { ref } from 'vue';
import TagInput from '../TagInput.vue';
import type { Tag } from '../../types';
import { inputStyles } from './styles';

defineProps<{
  title: string;
  url: string;
  tags: Tag[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'titleChange', title: string): void;
  (e: 'urlChange', url: string): void;
  (e: 'tagsChange', tags: Tag[]): void;
}>();

const handleTitleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('titleChange', target.value);
};

const handleUrlChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('urlChange', target.value);
};

const handleTagsChange = (tags: Tag[]) => {
  emit('tagsChange', tags);
};
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
        type="text"
        id="title"
        :value="title"
        @input="handleTitleChange"
        :class="`${inputStyles} text-xl`"
        required
      />
    </div>

    <div>
      <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
        Content URL (optional)
      </label>
      <input
        type="url"
        id="url"
        :value="url"
        @input="handleUrlChange"
        :class="inputStyles"
        placeholder="https://example.com"
      />
    </div>

    <div class="mt-4">
      <TagInput
        :selectedTags="tags"
        @tagsChange="handleTagsChange"
      />
    </div>
  </div>
</template> 
