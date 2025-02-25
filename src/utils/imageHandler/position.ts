import type { Visual } from '../../types'
import { calculateVisualSpace as calculateSpace } from '../calculations'

// Define the return type directly since it's missing from types.ts
interface Position {
  x: number
  y: number
}

/**
 * Validates and constrains a visual's position within boundaries (0-100%)
 *
 * @param visual The visual to validate position for
 * @param _containerWidth Optional container width (unused, for backward compatibility)
 * @param _containerHeight Optional container height (unused, for backward compatibility)
 * @returns Validated x,y position coordinates
 */
export function validateVisualPosition(
  visual: Visual,
  _containerWidth?: number,
  _containerHeight?: number,
): Position {
  // We're ignoring containerWidth and containerHeight to maintain simplicity
  // Position is always normalized as percentage (0-100)
  const x = Math.max(0, Math.min(100, visual.x))
  const y = Math.max(0, Math.min(100, visual.y))
  return { x, y }
}

// Re-export the function from calculations.ts
export const calculateVisualSpace = calculateSpace
