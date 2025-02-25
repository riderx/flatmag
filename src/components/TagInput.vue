<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, X, Trash2 } from 'lucide-vue-next';
import type { Tag } from '../types';
import { useTagStore } from '../store/tagStore';
import { useMagazineStore } from '../store/magazineStore';

const props = defineProps<{
  selectedTags: Tag[];
}>();

const emit = defineEmits<{
  (e: 'tagsChange', tags: Tag[]): void;
}>();

// Use the centralized tag store
const tagStore = useTagStore();
// Use the magazine store
const magazineStore = useMagazineStore();

// Get combined tags from global store and magazine-specific tags
const availableTags = computed(() => magazineStore.getAllTags);

const isAdding = ref(false);
const newTagName = ref('');
const newTagColor = ref('#3B82F6');
const tagToDelete = ref<Tag | null>(null);
const isGlobalTag = ref(true);

const handleAddTag = () => {
  if (newTagName.value.trim()) {
    const newTag: Tag = {
      id: Math.random().toString(36).substring(2, 9),
      name: newTagName.value.trim(),
      color: newTagColor.value
    };
    
    // Add to appropriate store
    if (isGlobalTag.value) {
      tagStore.addTag(newTag);
    } else {
      magazineStore.addMagazineTag(newTag);
    }
    
    // Update local state
    emit('tagsChange', [...props.selectedTags, newTag]);
    
    // Reset form
    newTagName.value = '';
    newTagColor.value = '#3B82F6';
    isAdding.value = false;
  }
};

const handleDeleteTag = (tag: Tag) => {
  // Remove from selected tags if present
  if (props.selectedTags.some(t => t.id === tag.id)) {
    emit('tagsChange', props.selectedTags.filter(t => t.id !== tag.id));
  }
  
  // Check if it's a global tag or magazine-specific tag and delete accordingly
  const isGlobal = tagStore.tags.some(t => t.id === tag.id);
  if (isGlobal) {
    tagStore.deleteTag(tag.id);
  } else {
    magazineStore.deleteMagazineTag(tag.id);
  }
  
  // Close modal
  tagToDelete.value = null;
};

const toggleTag = (tag: Tag) => {
  const isSelected = props.selectedTags.some(t => t.id === tag.id);
  if (isSelected) {
    emit('tagsChange', props.selectedTags.filter(t => t.id !== tag.id));
  } else {
    emit('tagsChange', [...props.selectedTags, tag]);
  }
};

// Helper function to determine if a color is light or dark
const isLightColor = (color: string) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
};

// Check if a tag is a global tag
const isGlobalTagFn = (tag: Tag) => {
  return tagStore.tags.some(t => t.id === tag.id);
};
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">
      Content Tags
    </label>
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <!-- Show all available tags with selected ones highlighted -->
        <div
          v-for="tag in availableTags"
          :key="tag.id"
          class="group inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="[
            props.selectedTags.some(t => t.id === tag.id) 
              ? 'ring-2 ring-offset-2 ring-gray-500 shadow-md' 
              : 'opacity-70 hover:opacity-100',
            isGlobalTagFn(tag) ? '' : 'border border-dashed border-gray-300'
          ]"
          :style="{
            backgroundColor: tag.color,
            color: isLightColor(tag.color) ? 'black' : 'white'
          }"
          @click="toggleTag(tag)"
        >
          <span>{{ tag.name }}</span>
          <span v-if="!isGlobalTagFn(tag)" class="ml-1 text-xs opacity-70">(local)</span>
          <button
            @click.stop="tagToDelete = tag"
            class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            title="Delete tag"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
        
        <div v-if="availableTags.length === 0" class="text-sm text-gray-500 italic">
          No tags created yet
        </div>
        
        <button
          @click.prevent="isAdding = true"
          class="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        >
          <Plus class="w-4 h-4 mr-1" />
          New Tag
        </button>
      </div>

      <div v-if="isAdding" class="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h4 class="text-sm font-medium text-gray-900">Create New Tag</h4>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Tag Name</label>
            <input
              type="text"
              v-model="newTagName"
              placeholder="Enter tag name"
              class="w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Color</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="newTagColor"
                class="h-9 w-9 rounded-sm border-2 border-white shadow-sm cursor-pointer"
              />
              <div
                class="h-9 px-3 rounded-sm flex items-center text-sm"
                :style="{
                  backgroundColor: newTagColor,
                  color: isLightColor(newTagColor) ? 'black' : 'white'
                }"
              >
                Preview
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Scope</label>
            <div class="inline-flex bg-gray-100 rounded-lg p-1">
              <button 
                @click="isGlobalTag = true" 
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                :class="isGlobalTag ? 'bg-white shadow-xs text-gray-800' : 'text-gray-600'"
              >
                Global
              </button>
              <button 
                @click="isGlobalTag = false" 
                class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                :class="!isGlobalTag ? 'bg-white shadow-xs text-gray-800' : 'text-gray-600'"
              >
                Magazine
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click.prevent="handleAddTag"
              :disabled="!newTagName.trim()"
              class="px-3 py-2 text-sm font-medium rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              @click.prevent="isAdding = false"
              class="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="tagToDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900">Delete Tag</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the tag "{{ tagToDelete.name }}"? 
                This will remove it {{ isGlobalTagFn(tagToDelete) ? 'globally' : 'from this magazine' }} and from all articles that use it.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="tagToDelete = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleDeleteTag(tagToDelete)"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 
