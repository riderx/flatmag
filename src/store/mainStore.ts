import { createPinia } from 'pinia';
import { watch } from 'vue';
import { useMagazineStore, type MagazineState } from './magazineStore';
import { loadSharedState } from '../utils/share';

// Create the Pinia instance
export const pinia = createPinia();

// Type for the combined state
interface AppState {
  magazine: MagazineState;
}

// Load state from localStorage
export const loadState = () => {
  try {
    // Get current magazine ID from URL
    const currentPath = window.location.pathname;
    const magazineId = currentPath.split('/flat-plan/')[1];
    
    if (!magazineId) {
      return undefined;
    }
    
    // Load magazine from magazines list
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    const magazine = magazines.find((m: { id: string }) => m.id === magazineId);
    
    if (!magazine) {
      return undefined;
    }
    
    // Get the magazine state or create a default one
    const magazineState = magazine.state || {
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
      shareId: null
    };
    
    // Ensure title, issueNumber, publicationDate, and pageRatio are set
    magazineState.title = magazine.title || 'My Magazine';
    magazineState.issueNumber = magazine.issue_number || 1;
    magazineState.publicationDate = magazine.publication_date || new Date().toISOString();
    magazineState.pageRatio = magazine.page_ratio || '1/1.4142';
    
    // Initialize state with magazine data
    const state: AppState = {
      magazine: magazineState
    };
    
    // Check for shared session
    const { shareId, permission } = loadSharedState();
    
    if (shareId) {
      state.magazine.isShared = true;
      state.magazine.allowEdit = permission === 'edit';
      state.magazine.shareId = shareId;
    }
    
    return state;
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

// Save state to localStorage
export const saveState = (magazineStore: ReturnType<typeof useMagazineStore>) => {
  try {
    // Get current magazine ID from URL
    const currentPath = window.location.pathname;
    const magazineId = currentPath.split('/flat-plan/')[1];
    
    if (!magazineId) return;
    
    // Load and update magazines list
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    const magazineIndex = magazines.findIndex((m: { id: string }) => m.id === magazineId);
    
    if (magazineIndex !== -1) {
      // Update magazine with current state
      magazines[magazineIndex] = {
        ...magazines[magazineIndex],
        title: magazineStore.title,
        issue_number: magazineStore.issueNumber,
        publication_date: magazineStore.publicationDate,
        page_ratio: magazineStore.pageRatio,
        state: {
          articles: magazineStore.articles,
          history: magazineStore.history,
          pages: magazineStore.pages,
          pageMargins: magazineStore.pageMargins,
          zoomLevel: magazineStore.zoomLevel,
          showList: magazineStore.showList,
          isShared: magazineStore.isShared,
          allowEdit: magazineStore.allowEdit,
          isConnecting: magazineStore.isConnecting,
          shareId: magazineStore.shareId,
          title: magazineStore.title,
          issueNumber: magazineStore.issueNumber,
          publicationDate: magazineStore.publicationDate,
          pageRatio: magazineStore.pageRatio
        }
      };
      
      // Save updated magazines list
      localStorage.setItem('magazines', JSON.stringify(magazines));
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

// This function should be called from a component setup function
export const setupStoreWatchers = () => {
  const state = loadState();
  const magazineStore = useMagazineStore();
  
  if (state) {
    // Initialize magazine store
    magazineStore.$patch({
      articles: state.magazine.articles,
      history: state.magazine.history,
      pages: state.magazine.pages,
      pageMargins: state.magazine.pageMargins,
      zoomLevel: state.magazine.zoomLevel,
      showList: state.magazine.showList,
      isShared: state.magazine.isShared,
      allowEdit: state.magazine.allowEdit,
      isConnecting: state.magazine.isConnecting,
      shareId: state.magazine.shareId,
      title: state.magazine.title,
      issueNumber: state.magazine.issueNumber,
      publicationDate: state.magazine.publicationDate,
      pageRatio: state.magazine.pageRatio
    });
    
    // Save initial state to localStorage
    magazineStore.saveToLocalStorage();
  }
  
  return { magazineStore };
};

// Helper function to safely access the magazine store from non-component contexts
let magazineStoreInstance: ReturnType<typeof useMagazineStore> | null = null;

export const getMagazineStore = () => {
  return magazineStoreInstance;
};

// This should be called from a component to set the store instance
export const setMagazineStoreInstance = (store: ReturnType<typeof useMagazineStore>) => {
  magazineStoreInstance = store;
}; 
