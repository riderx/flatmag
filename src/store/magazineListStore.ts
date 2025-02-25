import type { Magazine } from '@src/types'
import { defineStore } from 'pinia'

interface MagazineListState {
  magazines: Magazine[]
  loading: boolean
  error: string | null
  removedSharedMagazines: string[] // IDs of shared magazines removed from view
}

export const useMagazineListStore = defineStore('magazineList', {
  state: (): MagazineListState => ({
    magazines: [],
    loading: false,
    error: null,
    removedSharedMagazines: [],
  }),

  getters: {
    getMagazineById: state => (id: string) => {
      return state.magazines.find(magazine => magazine.id === id)
    },

    // Filtered magazines, excluding removed shared magazines
    filteredMagazines: (state) => {
      return state.magazines.filter(magazine => !state.removedSharedMagazines.includes(magazine.id))
    },
  },

  actions: {
    setMagazines(magazines: Magazine[]) {
      this.magazines = magazines
    },

    addMagazine(magazine: Magazine) {
      this.magazines.push(magazine)
    },

    updateMagazine(id: string, updates: Partial<Magazine>) {
      const index = this.magazines.findIndex(m => m.id === id)
      if (index !== -1) {
        this.magazines[index] = { ...this.magazines[index], ...updates }
      }
    },

    deleteMagazine(id: string) {
      this.magazines = this.magazines.filter(m => m.id !== id)

      // Also remove from removedSharedMagazines if it exists there
      this.removedSharedMagazines = this.removedSharedMagazines.filter(
        magazineId => magazineId !== id,
      )
    },

    removeSharedMagazineFromView(id: string) {
      // Add to removed list
      if (!this.removedSharedMagazines.includes(id)) {
        this.removedSharedMagazines.push(id)

        // Save to localStorage
        localStorage.setItem('removedSharedMagazines', JSON.stringify(this.removedSharedMagazines))
      }
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    async fetchMagazines() {
      this.loading = true
      this.error = null

      try {
        // This would be replaced with actual API call
        // const response = await supabaseClient.from('magazines').select('*');
        // this.magazines = response.data || [];

        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Load removed shared magazines from localStorage
        const removedSharedMagazines = localStorage.getItem('removedSharedMagazines')
        if (removedSharedMagazines) {
          this.removedSharedMagazines = JSON.parse(removedSharedMagazines)
        }
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch magazines'
      }
      finally {
        this.loading = false
      }
    },
  },
})
