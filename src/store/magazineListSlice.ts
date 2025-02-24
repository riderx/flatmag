import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Magazine } from '../types';
import { supabase } from '../utils/supabase';
import { getCurrentUserId } from '../utils/auth';

interface MagazineListState {
  magazines: Magazine[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: MagazineListState = {
  magazines: [],
  loading: false,
  error: null,
  initialized: false
};

export const fetchMagazines = createAsyncThunk(
  'magazineList/fetchMagazines',
  async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user ID found for fetching magazines');
      return [];
    }
    
    console.log('Fetching magazines for user:', userId);
    
    // Fetch both owned and shared magazines
    const [ownedResult, sharedResult] = await Promise.all([
      supabase
        .from('magazines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('magazines')
        .select('*')
        .neq('user_id', userId)
        .filter('shared_users', 'cs', `{"user_id":"${userId}"}`)
        .order('created_at', { ascending: false })
    ]);

    console.log('Query results:', {
      owned: ownedResult,
      shared: sharedResult
    });

    if (ownedResult.error) throw ownedResult.error;
    if (sharedResult.error) throw sharedResult.error;

    // Combine and mark shared magazines
    const magazines = [];
    
    // Add owned magazines
    for (const magazine of ownedResult.data || []) {
      magazines.push({ ...magazine, isShared: false });
    }
    
    // Add shared magazines
    for (const magazine of sharedResult.data || []) {
      const sharedUser = magazine.shared_users.find(u => u.user_id === userId);
      magazines.push({
        ...magazine,
        isShared: true,
        allowEdit: sharedUser?.permission === 'edit'
      });
    }

    return magazines;
  }
);

export const createMagazine = createAsyncThunk(
  'magazineList/createMagazine',
  async (magazine: Omit<Magazine, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const userId = await getCurrentUserId();
    console.log('Current user ID:', userId);
    
    if (!userId) {
      console.error('No user ID found');
      throw new Error('Not authenticated');
    }

    // Initialize default state
    const initialState = {
      articles: [],
      pages: 4,
      pageMargins: {},
      zoomLevel: '2',
      showList: true,
      isShared: false,
      allowEdit: true,
      isConnecting: false,
      history: {
        past: [],
        future: []
      }
    };

    const magazineData = {
      ...magazine,
      user_id: userId,
      state: initialState
    };
    console.log('Inserting magazine with data:', {
      ...magazineData,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('magazines')
      .insert(magazineData)
      .select()
      .single();

    if (error) {
      console.error('Error creating magazine:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        magazineData,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('Magazine created successfully:', data);
    return data;
  }
);

export const deleteMagazine = createAsyncThunk(
  'magazineList/deleteMagazine',
  async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    // Get magazine details
    const { data: magazine, error: fetchError } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!magazine) throw new Error('Magazine not found');
    
    // For owned magazines, soft delete
    if (magazine.user_id === userId) {
      const { error } = await supabase
        .from('magazines')
        .update({ is_deleted: true })
        .eq('id', id)
        .eq('user_id', userId); // Extra safety check
      
      if (error) throw error;
    } 
    // For shared magazines, remove current user from shared_users
    else {
      const updatedSharedUsers = (magazine.shared_users || [])
        .filter((u: SharedUser) => u.user_id !== userId);
      
      const { error } = await supabase
        .from('magazines')
        .update({ shared_users: updatedSharedUsers })
        .eq('id', id)
        .neq('user_id', userId); // Only update if not owner
      
      if (error) throw error;
    }

    return id;
  }
);

const magazineListSlice = createSlice({
  name: 'magazineList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMagazines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMagazines.fulfilled, (state, action) => {
        state.loading = false;
        state.magazines = action.payload;
        state.initialized = true;
      })
      .addCase(fetchMagazines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch magazines';
        state.initialized = true;
      })
      .addCase(createMagazine.fulfilled, (state, action) => {
        state.magazines.unshift(action.payload);
      })
      .addCase(deleteMagazine.fulfilled, (state, action) => {
        state.magazines = state.magazines.filter(mag => mag.id !== action.payload);
      });
  }
});

export default magazineListSlice.reducer;