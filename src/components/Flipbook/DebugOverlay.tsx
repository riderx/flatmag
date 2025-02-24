import React from 'react';

interface DebugInfo {
  transform: string;
  perspective: number;
  rotation: number;
  progress: number;
  polygons: number;
  fps: number;
}

interface DebugOverlayProps {
  info: DebugInfo;
  visible: boolean;
}

export function DebugOverlay({ info, visible }: DebugOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded font-mono text-sm z-50 space-y-1">
      <div>FPS: {info.fps}</div>
      <div>Progress: {info.progress.toFixed(3)}</div>
      <div>Rotation: {info.rotation.toFixed(2)}°</div>
      <div>Perspective: {info.perspective}px</div>
      <div>Polygons: {info.polygons}</div>
      <div className="text-xs truncate max-w-md" title={info.transform}>
        Transform: {info.transform}
      </div>
    </div>
  );
}