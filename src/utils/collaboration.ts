import { getRandomAnimal } from './animals';
import { getMagazineStore } from '../store/mainStore';
import { subscribeToChannel, broadcastToChannel } from './supabase';

export interface User {
  id: string;
  animal: {
    name: string;
    color: string;
  };
}

interface MessagePayload {
  event: string;
  data: Record<string, unknown>;
}

let userId = Math.random().toString(36).substr(2, 9);
let userAnimal = getRandomAnimal();
let connectedUsers: User[] = [{ id: userId, animal: userAnimal }];
let currentShareId: string | null = null;
let unsubscribeFunction: (() => void) | null = null;

export const initializeCollaboration = () => {
  if (!userId) {
    userId = Math.random().toString(36).substr(2, 9);
    userAnimal = getRandomAnimal();
  }

  // Add current user to connected users
  connectedUsers = [{
    id: userId,
    animal: userAnimal
  }];
};

export const joinSession = async (shareId: string) => {
  // Clean up any existing subscription
  if (unsubscribeFunction) {
    unsubscribeFunction();
    unsubscribeFunction = null;
  }

  currentShareId = shareId;
  initializeCollaboration();

  // Subscribe to channel
  unsubscribeFunction = subscribeToChannel(shareId, (payload) => {
    handleMessage(payload);
  });

  // Broadcast join event
  broadcastToChannel(shareId, 'user:join', {
    user: {
      id: userId,
      animal: userAnimal
    },
    timestamp: Date.now()
  });

  return () => {
    if (unsubscribeFunction) {
      unsubscribeFunction();
      unsubscribeFunction = null;
    }
  };
};

export const leaveSession = async () => {
  if (currentShareId && unsubscribeFunction) {
    // Broadcast leave event
    broadcastToChannel(currentShareId, 'user:leave', {
      userId,
      timestamp: Date.now()
    });

    // Cleanup
    unsubscribeFunction();
    unsubscribeFunction = null;
    currentShareId = null;
    connectedUsers = [{ id: userId, animal: userAnimal }];
  }
};

const handleMessage = (payload: MessagePayload) => {
  const { event, data } = payload;

  switch (event) {
    case 'user:join':
      handleUserJoin(data as { user: User });
      break;
    case 'user:leave':
      handleUserLeave(data as { userId: string });
      break;
    case 'state:update':
      handleStateUpdate(data as { allowEdit: boolean });
      break;
    default:
      console.log('Unknown event:', event);
  }
};

const handleUserJoin = (data: { user: User }) => {
  const { user } = data;
  if (!connectedUsers.some(u => u.id === user.id)) {
    connectedUsers.push(user);
  }
};

const handleUserLeave = (data: { userId: string }) => {
  const { userId: leavingUserId } = data;
  connectedUsers = connectedUsers.filter(user => user.id !== leavingUserId);
};

// This function will be called from a component that uses the store
export const updateShareStatus = (allowEdit: boolean) => {
  const magazineStore = getMagazineStore();
  if (magazineStore) {
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit: allowEdit,
      shareId: currentShareId
    });
  }
};

// Handle state updates from the channel
const handleStateUpdate = (data: { allowEdit: boolean }) => {
  // Store the data to be used later
  const pendingUpdate = {
    allowEdit: data.allowEdit
  };
  
  // Try to update the store directly if it's available
  const magazineStore = getMagazineStore();
  if (magazineStore) {
    magazineStore.setShareStatus({
      isShared: true,
      allowEdit: pendingUpdate.allowEdit,
      shareId: currentShareId
    });
  } else {
    // Log for debugging if store isn't available
    console.log('Received state update:', pendingUpdate);
  }
};

export const getSessionId = () => userId;
export const isCollaborating = () => !!currentShareId;
export const getConnectedPeers = () => connectedUsers.length - 1;
export const getConnectedUsers = () => connectedUsers;
