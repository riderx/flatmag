import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MagazineSettings, PageRatio } from '../types';

const initialState: MagazineSettings = {
  title: 'New Magazine',
  issueNumber: '1',
  publicationDate: new Date().toISOString().split('T')[0],
  pageRatio: '1/1.4142'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<MagazineSettings>>) => {
      return { ...state, ...action.payload };
    },
    setPageRatio: (state, action: PayloadAction<PageRatio>) => {
      state.pageRatio = action.payload;
    }
  }
});

export const { updateSettings, setPageRatio } = settingsSlice.actions;
export default settingsSlice.reducer;