import type { SharePermission } from '../types';
import { createShare, getShare, subscribeToChannel, broadcastToChannel } from './supabase';
import { store } from '../store/store';
import { setShareStatus } from '../store/magazineSlice';
import { initializeCollaboration } from './collaboration';

export const loadSharedState = () => {
  try {
    const shareData = localStorage.getItem('shareData');
    if (!shareData) return { shareId: null, permission: null };

    const { shareId, permission } = JSON.parse(shareData);
    return { shareId, permission };
  } catch (error) {
    console.error('Error loading shared state:', error);
    return { shareId: null, permission: null };
  }
};

export const initializeShare = async (allowEdit: boolean) => {
  try {
    // Initialize collaboration system
    initializeCollaboration();
    
    // Get current state
    const state = store.getState();
    const stateToShare = {
      magazine: state.magazine,
      settings: state.settings
    };

    // Create share
    const shareId = await createShare(JSON.stringify(stateToShare));
    
    // Subscribe to channel immediately
    subscribeToChannel(shareId, (payload) => {
      console.log('Received broadcast:', payload);
    });
    
    // Update store with share status
    store.dispatch(setShareStatus({
      isShared: true,
      allowEdit,
      shareId
    }));

    // Broadcast initial connection
    broadcastToChannel(shareId, 'user:join', {
      timestamp: Date.now()
    });
    
    return shareId;
  } catch (error) {
    console.error('Share initialization error:', error);
    throw error;
  }
};

export const getSharedState = async (shareId: string) => {
  try {
    const sharedData = await getShare(shareId);
    return sharedData ? JSON.parse(sharedData) : null;
  } catch (error) {
    console.error('Error fetching shared state:', error);
    return null;
  }
};