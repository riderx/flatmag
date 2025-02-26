<script setup lang="ts">
import { useMagazineListStore } from '@src/store/magazineListStore'
import { Calendar, FileText, Hash, Layout, Plus, Share2, Trash2, UserMinus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useMeta } from 'vue-meta'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'
import { pageRatios } from '../types'

useMeta({
  title: 'My Magazines - FlatMag',
  meta: [
    {
      name: 'description',
      content: 'View and manage your magazine flat plans.',
    },
  ],
})

const router = useRouter()
const magazineListStore = useMagazineListStore()
const isLoading = ref(true)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveFromViewModal = ref(false)
const magazineToDelete = ref<string | null>(null)
const magazineToRemove = ref<string | null>(null)
const newMagazine = ref({
  title: '',
  issue_number: '1',
  publication_date: new Date().toISOString().split('T')[0],
  page_ratio: '1/1.4142' as const,
})
const formErrors = ref({
  title: false,
})

// Reset errors when opening modal
function openCreateModal() {
  formErrors.value.title = false
  showCreateModal.value = true
}

onMounted(async () => {
  try {
    // For now, simulate loading from localStorage
    const storedMagazines = JSON.parse(localStorage.getItem('magazines') || '[]')
    magazineListStore.setMagazines(storedMagazines)

    // Load removed shared magazines list from localStorage
    await magazineListStore.fetchMagazines()
  }
  finally {
    isLoading.value = false
  }
})

function createMagazine() {
  // Validate form
  formErrors.value.title = !newMagazine.value.title

  // Don't proceed if there are errors
  if (formErrors.value.title) {
    return
  }

  const newMagazineData = {
    id: Math.random().toString(36).substring(2, 9),
    title: newMagazine.value.title,
    issue_number: newMagazine.value.issue_number,
    publication_date: newMagazine.value.publication_date,
    page_ratio: newMagazine.value.page_ratio,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'current-user',
    shared_users: [],
    state: {
      articles: [],
      history: {
        past: [],
        future: [],
      },
      pages: 4,
      pageMargins: {},
      zoomLevel: '2',
      showList: true,
      isShared: false,
      allowEdit: true,
      isConnecting: false,
      shareId: null,
      title: newMagazine.value.title,
      issueNumber: newMagazine.value.issue_number,
      publicationDate: newMagazine.value.publication_date,
      pageRatio: newMagazine.value.page_ratio,
    },
  }

  // Add to store
  magazineListStore.addMagazine(newMagazineData)

  // Save to localStorage
  const magazines = JSON.parse(localStorage.getItem('magazines') || '[]')
  magazines.push(newMagazineData)
  localStorage.setItem('magazines', JSON.stringify(magazines))

  // Reset form
  newMagazine.value = {
    title: '',
    issue_number: '1',
    publication_date: new Date().toISOString().split('T')[0],
    page_ratio: '1/1.4142' as const,
  }

  // Close modal
  showCreateModal.value = false

  // Automatically navigate to the flat-plan page
  router.push(`/flat-plan/${newMagazineData.id}`)
}

function confirmDeleteMagazine(id: string) {
  magazineToDelete.value = id
  showDeleteModal.value = true
}

function deleteMagazine() {
  if (magazineToDelete.value) {
    // Remove from store
    magazineListStore.deleteMagazine(magazineToDelete.value)

    // Save to localStorage
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]')
    const updated = magazines.filter((m: any) => m.id !== magazineToDelete.value)
    localStorage.setItem('magazines', JSON.stringify(updated))

    // Reset and close modal
    magazineToDelete.value = null
    showDeleteModal.value = false
  }
}

function confirmRemoveFromView(id: string) {
  magazineToRemove.value = id
  showRemoveFromViewModal.value = true
}

function removeFromView() {
  if (magazineToRemove.value) {
    // Remove shared magazine from view
    magazineListStore.removeSharedMagazineFromView(magazineToRemove.value)

    // Reset and close modal
    magazineToRemove.value = null
    showRemoveFromViewModal.value = false
  }
}

function isSharedMagazine(magazine: any) {
  // Check if this is a magazine shared with the current user
  return magazine.shared_users && magazine.shared_users.some((user: any) => user.user_id === 'current-user')
}

function openMagazine(id: string) {
  router.push(`/flat-plan/${id}`)
}
</script>

<template>
  <div class="min-h-screen py-12 bg-gray-100">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          My Magazines
        </h1>
        <button
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700"
          @click="openCreateModal"
        >
          <Plus class="w-5 h-5 mr-2" />
          New Magazine
        </button>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="flex items-center space-x-2">
          <Layout class="w-8 h-8 text-blue-600 animate-spin" />
          <span class="text-gray-600">Loading magazines...</span>
        </div>
      </div>

      <div v-else-if="magazineListStore.magazines.length === 0" class="p-8 text-center bg-white rounded-lg shadow-xs">
        <Layout class="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 class="mb-2 text-lg font-medium text-gray-900">
          No magazines yet
        </h3>
        <p class="mb-4 text-gray-500">
          Create your first magazine to get started
        </p>
        <button
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700"
          @click="openCreateModal"
        >
          <Plus class="w-5 h-5 mr-2" />
          Create Magazine
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="magazine in magazineListStore.filteredMagazines"
          :key="magazine.id"
          :class="`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
            isSharedMagazine(magazine) ? 'border-l-4 border-blue-500' : ''
          }`"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ magazine.title }}
                </h3>
                <span v-if="isSharedMagazine(magazine)" class="text-xs font-medium text-blue-600 flex items-center">
                  <Share2 class="w-3 h-3 mr-1" />
                  Shared with you
                </span>
              </div>

              <!-- Show different actions based on ownership -->
              <div class="flex">
                <!-- If shared, show remove from view option -->
                <button
                  v-if="isSharedMagazine(magazine)"
                  class="text-gray-400 hover:text-red-600"
                  title="Remove from my view"
                  @click.stop="confirmRemoveFromView(magazine.id)"
                >
                  <UserMinus class="w-5 h-5" />
                </button>

                <!-- If not shared, show delete option -->
                <button
                  v-else
                  class="text-gray-400 hover:text-red-600"
                  title="Delete magazine"
                  @click.stop="confirmDeleteMagazine(magazine.id)"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <div class="flex items-center text-sm text-gray-500">
                <Hash class="w-4 h-4 mr-2" />
                Issue {{ magazine.issue_number }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <Calendar class="w-4 h-4 mr-2" />
                {{ new Date(magazine.publication_date).toLocaleDateString() }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <FileText class="w-4 h-4 mr-2" />
                {{ pageRatios.find(r => r.value === magazine.page_ratio)?.name }}
              </div>
            </div>
            <button
              class="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200"
              @click="openMagazine(magazine.id)"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Magazine Modal -->
    <Modal :is-open="showCreateModal" @close="showCreateModal = false">
      <div>
        <h2 class="mb-6 text-2xl font-bold text-gray-900">
          Create New Magazine
        </h2>
        <div>
          <label for="title" class="block mb-2 text-lg font-medium text-gray-700">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="newMagazine.title"
            type="text"
            :class="`block w-full h-10 mt-1 text-xl rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`"
            placeholder="Enter magazine title"
          >
          <p v-if="formErrors.title" class="mt-1 text-sm text-red-600">
            Title is required
          </p>
        </div>

        <div class="mt-6">
          <label for="issue_number" class="block mb-2 text-sm font-medium text-gray-700">
            Issue Number
          </label>
          <input
            id="issue_number"
            v-model="newMagazine.issue_number"
            type="text"
            class="block w-full h-10 mt-1 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., 1, 2, Spring 2025, etc."
          >
        </div>

        <div class="mt-6">
          <label for="publication_date" class="block mb-2 text-sm font-medium text-gray-700">
            Publication Date
          </label>
          <input
            id="publication_date"
            v-model="newMagazine.publication_date"
            type="date"
            class="block w-full h-10 mt-1 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
          >
        </div>

        <div class="mt-6">
          <label for="page_ratio" class="block mb-2 text-sm font-medium text-gray-700">
            Page Ratio
          </label>
          <select
            id="page_ratio"
            v-model="newMagazine.page_ratio"
            class="block w-full h-10 mt-1 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
          >
            <option v-for="ratio in pageRatios" :key="ratio.value" :value="ratio.value">
              {{ ratio.name }} ({{ ratio.description }})
            </option>
          </select>
        </div>

        <div class="flex justify-end mt-8 space-x-3">
          <button
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="showCreateModal = false"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="createMagazine"
          >
            <Plus class="w-4 h-4 mr-2" />
            Create
          </button>
        </div>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-red-600">
            Delete Magazine
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ magazineToDelete && magazineListStore.magazines.find(m => m.id === magazineToDelete)?.isShared
              ? "Are you sure you want to remove this shared magazine from your list?"
              : "Are you sure you want to delete this magazine? This action cannot be undone." }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            @click="deleteMagazine"
          >
            {{ magazineToDelete && magazineListStore.magazines.find(m => m.id === magazineToDelete)?.isShared
              ? "Remove"
              : "Delete" }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Remove from view confirmation modal -->
    <Modal :is-open="showRemoveFromViewModal" @close="showRemoveFromViewModal = false">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-blue-600">
            Remove from My View
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            This will remove the magazine from your view, but it will still be accessible to other users it's shared with.
            You can access it again if the owner reshares it with you.
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
            @click="showRemoveFromViewModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            @click="removeFromView"
          >
            Remove
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>
