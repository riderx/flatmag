import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../utils/supabase';
import { getSessionId } from '../utils/collaboration';
import type { RootState } from '../store/store';

interface Cursor {
  id: string;
  user_id: string;
  x: number;
  y: number;
  color: string;
}

export function CursorOverlay() {
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [channel, setChannel] = useState<any>(null);
  const magazineId = useSelector((state: RootState) => state.magazine.id);
  const currentUserId = getSessionId();

  useEffect(() => {
    if (!magazineId) return;

    // Subscribe to cursor updates
    const cursorChannel = supabase.channel(`cursors-${magazineId}`);
    
    cursorChannel
      .on('presence', { event: 'sync' }, () => {
        const state = cursorChannel.presenceState();
        const cursorState = Object.values(state).flat().map((presence: any) => presence.cursor);
        setCursors(cursorState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setCursors(prev => [...prev, ...newPresences.map((p: any) => p.cursor)]);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setCursors(prev => prev.filter(c => !leftPresences.some((p: any) => p.cursor.id === c.id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await cursorChannel.track({
            cursor: {
              id: currentUserId,
              user_id: currentUserId,
              x: 0,
              y: 0,
              color: getRandomColor()
            }
          });
        }
      });

    setChannel(cursorChannel);

    return () => {
      cursorChannel.unsubscribe();
    };
  }, [magazineId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!channel || !currentUserId) return;

      const cursor = {
        id: currentUserId,
        user_id: currentUserId,
        x: e.clientX,
        y: e.clientY,
        color: cursors.find(c => c.id === currentUserId)?.color || getRandomColor()
      };

      channel.track({ cursor });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [channel, currentUserId, cursors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors
        .filter(cursor => cursor.user_id !== currentUserId)
        .map(cursor => (
          <div
            key={cursor.id}
            className="absolute"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ color: cursor.color }}
            >
              <path
                d="M1 1l7 14 2-6 6-2L1 1z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
    </div>
  );
}

function getRandomColor(): string {
  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}