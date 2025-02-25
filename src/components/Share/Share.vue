<script setup lang="ts">
import { ref, computed } from 'vue';
import { Share2, Check } from 'lucide-vue-next';
import ShareModal from './ShareModal.vue';
import { initializeShare } from '../../utils/share';
import { getConnectedUsers } from '../../utils/collaboration';
import { useMagazineStore } from '../../store/magazineStore';

const showModal = ref(false);
const allowEdit = ref(true);
const copied = ref(false);
const sharePermission = ref(allowEdit.value ? 'edit' : 'read');
const connectedUsers = computed(() => getConnectedUsers());

const magazineStore = useMagazineStore();

const handleBroadcast = () => {
  if (allowEdit.value) {
    console.log('Broadcast started');
    // Logic to start broadcast
  } else {
    console.log('Broadcast stopped');
    // Logic to stop broadcast
  }
};

const handleShare = async () => {
  try {
    // Initialize share session
    const shareId = await initializeShare(allowEdit.value, magazineStore);
    
    // Generate share URL
    const shareUrl = new URL('/share', window.location.origin);
    shareUrl.searchParams.set('id', shareId);
    
    // Store permission in state
    sharePermission.value = allowEdit.value ? 'edit' : 'read';
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl.toString());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
    
    // Activate broadcast
    handleBroadcast();
    
    // Close modal
    showModal.value = false;
  } catch (error) {
    console.error('Error sharing:', error);
    alert('Failed to create share link. Please try again.');
  }
};

const handleAllowEditChange = (value: boolean) => {
  allowEdit.value = value;
};
</script>

<template>
  <button
    @click="showModal = true"
    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border rounded-md hover:bg-gray-50"
  >
    <Share2 class="w-4 h-4 mr-2" />
    Share
  </button>

  <ShareModal
    :isOpen="showModal"
    @close="showModal = false"
    @share="handleShare"
    :allowEdit="allowEdit"
    @allowEditChange="handleAllowEditChange"
    :copied="copied"
    :connectedUsers="connectedUsers.length"
  />
</template> 
