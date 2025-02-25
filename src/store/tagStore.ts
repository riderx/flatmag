import type { Tag } from '../types'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Default tags to use if no saved tags exist
const defaultTags: Tag[] = [
  { id: 'todo', name: 'To Do', color: '#EF4444' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'to-review', name: 'To Review', color: '#3B82F6' },
  { id: 'done', name: 'Done', color: '#10B981' },
]

// Define the tag store
export const useTagStore = defineStore('tags', () => {
  // State
  const tags = ref<Tag[]>(loadTagsFromStorage())

  // Watch for changes to save to localStorage
  watch(tags, (newTags) => {
    localStorage.setItem('magazine-tags', JSON.stringify(newTags))
  }, { deep: true })

  // Load tags from localStorage
  function loadTagsFromStorage(): Tag[] {
    try {
      const savedTags = localStorage.getItem('magazine-tags')
      if (savedTags) {
        return JSON.parse(savedTags)
      }
      return defaultTags
    }
    catch (error) {
      console.warn('Failed to load tags from storage, using defaults', error)
      return defaultTags
    }
  }

  // Actions
  function addTag(tag: Tag) {
    tags.value.push(tag)
  }

  function updateTag(updatedTag: Tag) {
    const index = tags.value.findIndex(tag => tag.id === updatedTag.id)
    if (index !== -1) {
      tags.value[index] = updatedTag
    }
  }

  function deleteTag(id: string) {
    tags.value = tags.value.filter(tag => tag.id !== id)
  }

  function getDefaultTags() {
    return defaultTags
  }

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getDefaultTags,
  }
})
