<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { RouterLink, useRouter } from 'vue-router';
import { Layout, Plus, Trash2, Calendar, Hash, FileText } from 'lucide-vue-next';
import { useMagazineListStore } from '@src/store/magazineListStore';
import Modal from '../components/Modal.vue';
import type { Magazine } from '@src/types';
import { pageRatios } from '../types';

useMeta({
  title: 'My Magazines - FlatMag',
  meta: [
    {
      name: 'description',
      content: 'View and manage your magazine flat plans.'
    }
  ]
});

const router = useRouter();
const magazineListStore = useMagazineListStore();
const isLoading = ref(true);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const magazineToDelete = ref<string | null>(null);
const newMagazine = ref({
  title: '',
  issue_number: '1',
  publication_date: new Date().toISOString().split('T')[0],
  page_ratio: '1/1.4142' as const
});

onMounted(async () => {
  try {
    // For now, simulate loading from localStorage
    const storedMagazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    magazineListStore.setMagazines(storedMagazines);
  } finally {
    isLoading.value = false;
  }
});

const createMagazine = () => {
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
        future: []
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
      pageRatio: newMagazine.value.page_ratio
    }
  };

  // Add to store
  magazineListStore.addMagazine(newMagazineData);
  
  // Save to localStorage
  const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
  magazines.push(newMagazineData);
  localStorage.setItem('magazines', JSON.stringify(magazines));
  
  // Reset and close modal
  newMagazine.value = {
    title: '',
    issue_number: '1',
    publication_date: new Date().toISOString().split('T')[0],
    page_ratio: '1/1.4142' as const
  };
  showCreateModal.value = false;
};

const confirmDeleteMagazine = (id: string) => {
  magazineToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteMagazine = () => {
  if (magazineToDelete.value) {
    // Remove from store
    magazineListStore.deleteMagazine(magazineToDelete.value);
    
    // Save to localStorage
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    const updated = magazines.filter((m: any) => m.id !== magazineToDelete.value);
    localStorage.setItem('magazines', JSON.stringify(updated));
    
    // Reset and close modal
    magazineToDelete.value = null;
    showDeleteModal.value = false;
  }
};

const openMagazine = (id: string) => {
  router.push(`/flat-plan/${id}`);
};
</script>

<template>
  <div class="min-h-screen py-12 bg-gray-100">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Magazines</h1>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700"
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
        <h3 class="mb-2 text-lg font-medium text-gray-900">No magazines yet</h3>
        <p class="mb-4 text-gray-500">Create your first magazine to get started</p>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700"
        >
          <Plus class="w-5 h-5 mr-2" />
          Create Magazine
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="magazine in magazineListStore.magazines"
          :key="magazine.id"
          :class="`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
            magazine.isShared ? 'border-l-4 border-blue-500' : ''
          }`"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ magazine.title }}
                </h3>
                <span v-if="magazine.isShared" class="text-xs font-medium text-blue-600">
                  Shared with you
                </span>
              </div>
              <button
                v-if="!magazine.isShared"
                @click="confirmDeleteMagazine(magazine.id)"
                class="text-gray-400 hover:text-red-600"
              >
                <Trash2 class="w-5 h-5" />
              </button>
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
              @click="openMagazine(magazine.id)"
              class="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Magazine Modal -->
    <Modal :isOpen="showCreateModal" @close="showCreateModal = false">
      <div>
        <h2 class="mb-6 text-2xl font-bold text-gray-900">
          Create New Magazine
        </h2>
        <div>
          <label for="title" class="block mb-2 text-lg font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            v-model="newMagazine.title"
            class="block w-full h-10 mt-1 text-xl border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter magazine title"
          />
        </div>

        <div class="mt-6">
          <label for="issue_number" class="block mb-2 text-sm font-medium text-gray-700">
            Issue Number
          </label>
          <input
            type="text"
            id="issue_number"
            v-model="newMagazine.issue_number"
            class="block w-full h-10 mt-1 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., 1, 2, Spring 2025, etc."
          />
        </div>

        <div class="mt-6">
          <label for="publication_date" class="block mb-2 text-sm font-medium text-gray-700">
            Publication Date
          </label>
          <input
            type="date"
            id="publication_date"
            v-model="newMagazine.publication_date"
            class="block w-full h-10 mt-1 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500"
          />
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
            @click="showCreateModal = false"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            @click="createMagazine"
            :disabled="!newMagazine.title || !newMagazine.issue_number"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus class="w-4 h-4 mr-2" />
            Create
          </button>
        </div>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :isOpen="showDeleteModal" @close="showDeleteModal = false">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-red-600">Delete Magazine</h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ magazineToDelete && magazineListStore.magazines.find(m => m.id === magazineToDelete)?.isShared
              ? "Are you sure you want to remove this shared magazine from your list?"
              : "Are you sure you want to delete this magazine? This action cannot be undone." }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteMagazine"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {{ magazineToDelete && magazineListStore.magazines.find(m => m.id === magazineToDelete)?.isShared
              ? "Remove"
              : "Delete" }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template> 
