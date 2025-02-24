import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tag } from '../types';

interface TagState {
  tags: Tag[];
}

const initialState: TagState = {
  tags: [
    { id: 'todo', name: 'To Do', color: '#EF4444' },
    { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
    { id: 'to-review', name: 'To Review', color: '#3B82F6' },
    { id: 'done', name: 'Done', color: '#10B981' }
  ]
};

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
    },
    deleteTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    }
  }
});

export const { addTag, updateTag, deleteTag } = tagSlice.actions;
export default tagSlice.reducer;