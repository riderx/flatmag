import { configureStore } from '@reduxjs/toolkit';
import magazineReducer from './magazineSlice';
import tagReducer from './tagSlice';
import magazineListReducer from './magazineListSlice';
import { loadSharedState } from '../utils/share';

const loadState = () => {
  try {
    // Get current magazine ID from URL
    const currentPath = window.location.pathname;
    const magazineId = currentPath.split('/flat-plan/')[1];
    
    if (!magazineId) {
      return undefined;
    }
    
    // Load magazine from magazines list
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    const magazine = magazines.find((m: any) => m.id === magazineId);
    
    if (!magazine) {
      return undefined;
    }
    
    // Initialize state with magazine data
    const state = {
      magazine: magazine.state || {
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
        title: magazine.title || 'My Magazine',
        issueNumber: magazine.issue_number || 1,
        publicationDate: magazine.publication_date || new Date().toISOString().split('T')[0],
        pageRatio: magazine.page_ratio || '1/1.4142'
      }
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

const saveState = (state: any) => {
  try {
    // Get current magazine ID from URL
    const currentPath = window.location.pathname;
    const magazineId = currentPath.split('/flat-plan/')[1];
    
    if (!magazineId) return;
    
    // Load and update magazines list
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    const magazineIndex = magazines.findIndex((m: any) => m.id === magazineId);
    
    if (magazineIndex !== -1) {
      // Update magazine with current state
      magazines[magazineIndex] = {
        ...magazines[magazineIndex],
        title: state.magazine.title,
        issue_number: state.magazine.issueNumber,
        publication_date: state.magazine.publicationDate,
        page_ratio: state.magazine.pageRatio,
        state: state.magazine
      };
      
      // Save updated magazines list
      localStorage.setItem('magazines', JSON.stringify(magazines));
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

export const store = configureStore({
  reducer: {
    magazine: magazineReducer,
    tags: tagReducer,
    magazineList: magazineListReducer
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
