import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Article, HistoryEntry, ZoomLevel } from '../types';

interface MagazineState {
  articles: Article[];
  pages: number;
  pageMargins: Record<number, { top: number; right: number; bottom: number; left: number; }>;
  zoomLevel: ZoomLevel;
  showList: boolean;
  isShared: boolean;
  allowEdit: boolean;
  isConnecting: boolean;
  shareId: string | null;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}

const initialState: MagazineState = {
  articles: [],
  pages: 4,
  pageMargins: {},
  zoomLevel: '2',
  showList: true,
  isShared: false,
  allowEdit: true,
  isConnecting: false,
  shareId: null,
  history: {
    past: [],
    future: []
  }
};

const addToHistory = (state: MagazineState, description: string) => {
  state.history.past.push({
    articles: JSON.parse(JSON.stringify(state.articles)),
    description
  });
  state.history.future = [];
};

const magazineSlice = createSlice({
  name: 'magazine',
  initialState,
  reducers: {
    addArticle: (state, action: PayloadAction<Article>) => {
      state.articles.push(action.payload);
      addToHistory(state, `Added article: ${action.payload.title}`);
    },
    updateArticle: (state, action: PayloadAction<Article>) => {
      const index = state.articles.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = action.payload;
        addToHistory(state, `Updated article: ${action.payload.title}`);
      }
    },
    deleteArticle: (state, action: PayloadAction<string>) => {
      const article = state.articles.find(a => a.id === action.payload);
      if (article) {
        state.articles = state.articles.filter(a => a.id !== action.payload);
        addToHistory(state, `Deleted article: ${article.title}`);
      }
    },
    reorderArticles: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
      addToHistory(state, 'Reordered articles');
    },
    setPages: (state, action: PayloadAction<number>) => {
      state.pages = action.payload;
      addToHistory(state, `Set pages to ${action.payload}`);
    },
    setZoomLevel: (state, action: PayloadAction<ZoomLevel>) => {
      state.zoomLevel = action.payload;
    },
    setShowList: (state, action: PayloadAction<boolean>) => {
      state.showList = action.payload;
    },
    updatePageMargins: (state, action: PayloadAction<{
      page: number;
      margins: { top: number; right: number; bottom: number; left: number; };
    }>) => {
      state.pageMargins[action.payload.page] = action.payload.margins;
      addToHistory(state, `Updated margins for page ${action.payload.page}`);
    },
    updateAllMargins: (state, action: PayloadAction<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>) => {
      for (let i = 1; i <= state.pages; i++) {
        state.pageMargins[i] = action.payload;
      }
      addToHistory(state, 'Updated all page margins');
    },
    updateArticleMargins: (state, action: PayloadAction<{
      articleId: string;
      margins: { top: number; right: number; bottom: number; left: number; };
    }>) => {
      const article = state.articles.find(a => a.id === action.payload.articleId);
      if (article) {
        for (let i = article.startPage; i < article.startPage + article.pageCount; i++) {
          state.pageMargins[i] = action.payload.margins;
        }
        addToHistory(state, `Updated margins for article: ${article.title}`);
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setShareStatus: (state, action: PayloadAction<{ isShared: boolean; allowEdit: boolean; shareId: string | null }>) => {
      state.isShared = action.payload.isShared;
      state.allowEdit = action.payload.allowEdit;
      state.shareId = action.payload.shareId;
    },
    undo: (state) => {
      const previous = state.history.past.pop();
      if (previous) {
        state.history.future.push({
          articles: JSON.parse(JSON.stringify(state.articles)),
          description: 'Undo: ' + previous.description
        });
        state.articles = previous.articles;
      }
    },
    redo: (state) => {
      const next = state.history.future.pop();
      if (next) {
        state.history.past.push({
          articles: JSON.parse(JSON.stringify(state.articles)),
          description: 'Redo: ' + next.description
        });
        state.articles = next.articles;
      }
    },
    jumpToHistory: (state, action: PayloadAction<number>) => {
      const targetIndex = action.payload;
      if (targetIndex >= 0 && targetIndex < state.history.past.length) {
        const currentState = {
          articles: JSON.parse(JSON.stringify(state.articles)),
          description: 'Jump from current state'
        };
        
        // Move all states after target to future
        const movingToFuture = state.history.past.slice(targetIndex + 1).reverse();
        state.history.future = [...movingToFuture, currentState, ...state.history.future];
        
        // Set current state to target
        state.articles = state.history.past[targetIndex].articles;
        
        // Remove all states after target from past
        state.history.past = state.history.past.slice(0, targetIndex);
      }
    },
    resetState: () => initialState,
    syncState: (state, action: PayloadAction<{ magazine: MagazineState }>) => {
      return {
        ...state,
        ...action.payload.magazine,
        isConnecting: false
      };
    }
  }
});

export const {
  addArticle,
  updateArticle,
  deleteArticle,
  reorderArticles,
  setPages,
  setZoomLevel,
  setShowList,
  updatePageMargins,
  updateAllMargins,
  updateArticleMargins,
  setConnectionStatus,
  setShareStatus,
  undo,
  redo,
  jumpToHistory,
  resetState,
  syncState
} = magazineSlice.actions;

export default magazineSlice.reducer;