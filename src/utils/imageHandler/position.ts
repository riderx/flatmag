import type { Visual } from '../../types';
import type { ImagePosition } from './types';

export function validateVisualPosition(
  visual: Visual,
  containerWidth: number,
  containerHeight: number
): ImagePosition {
  const x = Math.max(0, Math.min(100, visual.x));
  const y = Math.max(0, Math.min(100, visual.y));
  return { x, y };
}

export function calculateVisualSpace(visual: Visual): number {
  if (visual.width === 'full' && visual.height === 'full') {
    return 100;
  }

  const getPercent = (ratio: string) => {
    if (ratio === 'full') return 100;
    const [num, den] = ratio.split('/').map(Number);
    return (num / den) * 100;
  };

  const width = getPercent(visual.width);
  const height = getPercent(visual.height);
  
  return Math.min((width * height) / 100, 100);
}