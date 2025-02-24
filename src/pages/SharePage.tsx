import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { WaitingRoom } from '../components/WaitingRoom';
import { loadSharedState, getSharedState } from '../utils/share';
import { joinSession } from '../utils/collaboration';
import { setConnectionStatus, syncState } from '../store/magazineSlice';
import { updateSettings } from '../store/settingsSlice';

type ConnectionStatus = 'connecting' | 'waiting' | 'syncing' | 'error';

export function SharePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: shareId } = useParams();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | undefined>();
  const { permission } = loadSharedState();

  useEffect(() => {
    const connectToSession = async () => {
      if (!shareId) {
        console.log('No share ID found, redirecting to home');
        navigate('/', { replace: true });
        return;
      }

      try {
        setStatus('connecting');
        console.log('Connecting to share:', shareId);
        
        // Get shared state
        const sharedState = await getSharedState(shareId);
        if (!sharedState) {
          throw new Error('Share not found or expired');
        }
        
        console.log('Syncing magazine state...');
        setStatus('syncing');
        dispatch(setConnectionStatus(true));
        
        // Initialize collaboration
        await joinSession(shareId);
        
        // Sync the state
        dispatch(syncState({
          magazine: {
            ...sharedState.magazine,
            isShared: true,
            allowEdit: permission === 'edit'
          }
        }));

        // Update settings
        dispatch(updateSettings(sharedState.settings));
        
        // Wait a moment to ensure state is synced
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a unique ID for the shared magazine
        const magazineId = Math.random().toString(36).substr(2, 9);
        
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
        navigate(`/flat-plan/${magazineId}`, { replace: true });
      } catch (err) {
        console.error('Share error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to join session');
        dispatch(setConnectionStatus(false));
      }
    };

    connectToSession();
  }, [shareId, permission, navigate, dispatch]);

  return <WaitingRoom status={status} error={error} />;
}
