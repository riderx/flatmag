import type { SizeRatio, Visual } from '../../types'
import { calculateVisualSpace as calculateSpace } from '../calculations'

// Define the return type directly since it's missing from types.ts
interface Position {
  x: number
  y: number
}

/**
 * Helper function to convert size ratio to percentage
 */
function sizeToPercent(size: SizeRatio): number {
  switch (size) {
    case 'full': return 100
    case '1/2': return 50
    case '1/3': return 33.33
    case '1/4': return 25
    case '1/6': return 16.67
    case '1/8': return 12.5
    case '1/10': return 10
    default: return 50
  }
}

/**
 * Validates and constrains a visual's position within boundaries (0-100%)
 * Ensures the visual cannot be dragged outside page boundaries
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
  // Calculate visual width and height in percentage
  const widthPercent = sizeToPercent(visual.width as SizeRatio)
  const heightPercent = sizeToPercent(visual.height as SizeRatio)

  // Ensure the visual stays within page boundaries with a small margin
  // The visual can go to the edge, but not completely off the page
  const maxX = 100 - widthPercent
  const maxY = 100 - heightPercent

  // Constrain x and y coordinates
  const x = Math.max(0, Math.min(maxX, visual.x))
  const y = Math.max(0, Math.min(maxY, visual.y))

  return { x, y }
}

// Re-export the function from calculations.ts
export const calculateVisualSpace = calculateSpace
