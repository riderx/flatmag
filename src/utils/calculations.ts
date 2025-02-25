import type { ArticlePage, LineHeight, SizeRatio, Visual } from '../types'

export function ratioToPercent(ratio: SizeRatio): number {
  if (ratio === 'full')
    return 100
  try {
    console.log('ratio', ratio)
    const [num, den] = (ratio || '1/1').split('/').map(Number)
    if (!num || !den || Number.isNaN(num) || Number.isNaN(den))
      return 100
    return (num / den) * 100
  }
  catch (error) {
    console.error('Error parsing ratio:', ratio, error)
    return 100
  }
}

export function calculateRequiredPages(visuals: Visual[]): number {
  if (visuals.length === 0)
    return 1

  // Group visuals by page
  const visualsByPage: Record<number, Visual[]> = {}

  visuals.forEach((visual) => {
    const page = visual.page || 1
    if (!visualsByPage[page]) {
      visualsByPage[page] = []
    }
    visualsByPage[page].push(visual)
  })

  // Find the highest page number
  return Math.max(...Object.keys(visualsByPage).map(Number))
}

function calculateVisualImpact(visual: Visual): { spaceOccupied: number, pushDownPercent: number } {
  const width = ratioToPercent(visual.width || '1/1')
  const height = ratioToPercent(visual.height || '1/1')
  const spaceOccupied = Math.min((width * height) / 100, 100)

  // Calculate how much the visual pushes text down
  const pushDownPercent = Math.min(visual.y + height, 100) - visual.y

  return { spaceOccupied, pushDownPercent }
}

export function calculateVisualSpace(visual: Visual): number {
  const { spaceOccupied } = calculateVisualImpact(visual)
  return spaceOccupied
}

export function calculatePageAvailableSpace(visuals: Visual[], margins: { top: number, right: number, bottom: number, left: number } = { top: 0, right: 0, bottom: 0, left: 0 }): number {
  if (visuals.length === 0) {
    return Math.max(0, 100 - margins.top - margins.bottom)
  }

  // Sort visuals by vertical position
  const sortedVisuals = [...visuals].sort((a, b) => a.y - b.y)

  // Calculate available space considering vertical stacking and margins
  const totalHeight = 100 - margins.top - margins.bottom
  let occupiedSpace = 0
  let currentY = margins.top

  for (const visual of sortedVisuals) {
    const { pushDownPercent } = calculateVisualImpact(visual)

    // Calculate overlap with previous visuals
    if (visual.y < currentY) {
      occupiedSpace += Math.min(pushDownPercent, currentY - visual.y)
    }
    else {
      occupiedSpace += pushDownPercent
    }

    // Update current Y position
    currentY = Math.max(currentY, visual.y + pushDownPercent)
  }

  return Math.max(0, totalHeight - occupiedSpace)
}

export function calculateAvailableLines(lineHeight: LineHeight, availableSpace: number): number {
  const [num, den] = lineHeight.split('/').map(Number)
  const lineHeightPercent = (num / den)
  return Math.floor((availableSpace / 100) / lineHeightPercent)
}

export function calculateWordsPerLine(columns: number): number {
  // Base words per line for a full-width column
  const baseWordsPerLine = 12

  // Adjust words per line based on column width
  const columnMultiplier = {
    1: 1, // Full width
    2: 0.45, // Each column is slightly less than half
    3: 0.3, // Each column is about a third
  }[columns] || 1

  return Math.floor(baseWordsPerLine * columnMultiplier)
}

export function calculateWordsPerPage(lineHeight: LineHeight, columns: 1 | 2 | 3, baseWordsPerPage: number): number {
  // Extract the ratio from the lineHeight string (e.g., "1/50" -> 1/50)
  const denominator = Number.parseFloat(lineHeight.split('/')[1])

  // Create a properly formatted ratio string for ratioToPercent
  const ratio = (denominator ? `1/${denominator}` : '1/1') as SizeRatio

  // Calculate words per page based on line height and columns
  const wordsPerColumn = Math.floor(baseWordsPerPage * ratioToPercent(ratio))
  return wordsPerColumn * columns
}

export function distributeWordsAcrossPages(totalWords: number, pages: ArticlePage[], lineHeight: LineHeight, columns: 1 | 2 | 3): ArticlePage[] {
  let remainingWords = totalWords

  return pages.map((page) => {
    const wordsForPage = calculateWordsPerPage(lineHeight, columns, page.availableSpace)
    const pageWords = Math.min(remainingWords, wordsForPage)
    remainingWords -= pageWords

    return {
      ...page,
      wordCount: pageWords,
    }
  })
}
