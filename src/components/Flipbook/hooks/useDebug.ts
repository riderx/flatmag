import { useState, useCallback } from 'react';

export function useDebug() {
  const [debugInfo, setDebugInfo] = useState({
    transform: '',
    perspective: 0,
    rotation: 0,
    progress: 0,
    polygons: 0,
    fps: 0,
    lastFrameTime: performance.now()
  });

  const updateDebugInfo = useCallback((info: Partial<typeof debugInfo>) => {
    setDebugInfo(prev => {
      const now = performance.now();
      const fps = Math.round(1000 / (now - prev.lastFrameTime));
      return {
        ...prev,
        ...info,
        fps,
        lastFrameTime: now
      };
    });
  }, []);

  return { debugInfo, updateDebugInfo };
}