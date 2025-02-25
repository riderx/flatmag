<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMagazineStore } from '../store/magazineStore';
import { loadSharedState, getSharedState } from '../utils/share';
import { joinSession } from '../utils/collaboration';
import WaitingRoom from '../components/WaitingRoom.vue';

const router = useRouter();
const magazineStore = useMagazineStore();

// Status states
const status = ref<'connecting' | 'waiting' | 'syncing' | 'error'>('connecting');
const error = ref<string | undefined>(undefined);

// Extract shareId from query parameters
const urlParams = new URLSearchParams(window.location.search);
const shareId = urlParams.get('id');
const { permission } = loadSharedState();

onMounted(async () => {
  if (!shareId) {
    console.log('No share ID found, redirecting to home');
    router.replace('/');
    return;
  }

  try {
    status.value = 'connecting';
    console.log('Connecting to share:', shareId);
    
    // Get shared state
    const sharedState = await getSharedState(shareId);
    if (!sharedState) {
      throw new Error('Share not found or expired');
    }
    
    console.log('Syncing magazine state...');
    status.value = 'syncing';
    magazineStore.setConnectionStatus(true);
    
    // Initialize collaboration
    await joinSession(shareId);
    
    // Sync the state
    magazineStore.syncState({
      magazine: {
        ...sharedState.magazine,
        isShared: true,
        allowEdit: permission === 'edit',
        // Add settings directly to the magazine object
        title: sharedState.settings?.title || 'Shared Magazine',
        issueNumber: sharedState.settings?.issueNumber || 1,
        publicationDate: sharedState.settings?.publicationDate || new Date().toISOString().split('T')[0],
        pageRatio: sharedState.settings?.pageRatio || '1/1.4142'
      }
    });
    
    // Wait a moment to ensure state is synced
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a unique ID for the shared magazine
    const magazineId = Math.random().toString(36).substring(2, 9);
    
    // Save the magazine to local storage
    const magazines = JSON.parse(localStorage.getItem('magazines') || '[]');
    magazines.push({
      id: magazineId,
      title: sharedState.settings?.title || 'Shared Magazine',
      issue_number: sharedState.settings?.issueNumber || '1',
      publication_date: sharedState.settings?.publicationDate || new Date().toISOString().split('T')[0],
      page_ratio: sharedState.settings?.pageRatio || '1/1.4142',
      created_at: new Date().toISOString(),
      state: sharedState.magazine,
      isShared: true
    });
    localStorage.setItem('magazines', JSON.stringify(magazines));
    
    // Redirect to flat-plan with the new magazine ID
    console.log('Share loaded successfully, redirecting to editor');
    router.replace(`/flat-plan/${magazineId}`);
  } catch (err: any) {
    console.error('Share error:', err);
    status.value = 'error';
    error.value = err instanceof Error ? err.message : 'Failed to join session';
    magazineStore.setConnectionStatus(false);
  }
});
</script>

<template>
  <WaitingRoom :status="status" :error="error" />
</template> 
