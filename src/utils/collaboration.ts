import { getRandomAnimal } from './animals';
import { store } from '../store/store';
import { setShareStatus } from '../store/magazineSlice';
import { subscribeToChannel, broadcastToChannel } from './supabase';

interface User {
  id: string;
  animal: {
    name: string;
    color: string;
  };
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

const handleMessage = (payload: any) => {
  const { event, data } = payload;

  switch (event) {
    case 'user:join':
      handleUserJoin(data);
      break;
    case 'user:leave':
      handleUserLeave(data);
      break;
    case 'state:update':
      handleStateUpdate(data);
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

const handleStateUpdate = (data: any) => {
  store.dispatch(setShareStatus({
    isShared: true,
    allowEdit: data.allowEdit,
    shareId: currentShareId
  }));
};

export const getSessionId = () => userId;
export const isCollaborating = () => !!currentShareId;
export const getConnectedPeers = () => connectedUsers.length - 1;
export const getConnectedUsers = () => connectedUsers;