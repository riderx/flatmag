import { defineStore } from 'pinia';
import type { Magazine } from '@src/types';

interface MagazineListState {
  magazines: Magazine[];
  loading: boolean;
  error: string | null;
}

export const useMagazineListStore = defineStore('magazineList', {
  state: (): MagazineListState => ({
    magazines: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getMagazineById: (state) => (id: string) => {
      return state.magazines.find(magazine => magazine.id === id);
    }
  },
  
  actions: {
    setMagazines(magazines: Magazine[]) {
      this.magazines = magazines;
    },
    
    addMagazine(magazine: Magazine) {
      this.magazines.push(magazine);
    },
    
    updateMagazine(id: string, updates: Partial<Magazine>) {
      const index = this.magazines.findIndex(m => m.id === id);
      if (index !== -1) {
        this.magazines[index] = { ...this.magazines[index], ...updates };
      }
    },
    
    deleteMagazine(id: string) {
      this.magazines = this.magazines.filter(m => m.id !== id);
    },
    
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    
    setError(error: string | null) {
      this.error = error;
    },
    
    async fetchMagazines() {
      this.loading = true;
      this.error = null;
      
      try {
        // This would be replaced with actual API call
        // const response = await supabaseClient.from('magazines').select('*');
        // this.magazines = response.data || [];
        
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch magazines';
      } finally {
        this.loading = false;
      }
    }
  }
}); 
