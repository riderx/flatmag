import type { LineHeight, Visual, SizeRatio, ArticlePage } from '../types';

const MIN_WORDS_PER_PAGE = 50; // Minimum words that should fit on a page
const FULL_PAGE_THRESHOLD = 90; // Percentage threshold to consider a visual as taking a full page

export const ratioToPercent = (ratio: SizeRatio): number => {
  if (ratio === 'full') return 100;
  try {
    const [num, den] = (ratio || '1/1').split('/').map(Number);
    if (!num || !den || isNaN(num) || isNaN(den)) return 100;
    return (num / den) * 100;
  } catch (error) {
    console.error('Error parsing ratio:', ratio, error);
    return 100;
  }
};

export const calculateRequiredPages = (visuals: Visual[]): number => {
  if (visuals.length === 0) return 1;
  
  // Group visuals by page
  const visualsByPage: Record<number, Visual[]> = {};
  
  visuals.forEach(visual => {
    const page = visual.page || 1;
    if (!visualsByPage[page]) {
      visualsByPage[page] = [];
    }
    visualsByPage[page].push(visual);
  });
  
  // Find the highest page number
  return Math.max(...Object.keys(visualsByPage).map(Number));
};

const calculateVisualImpact = (visual: Visual): { spaceOccupied: number; pushDownPercent: number } => {
  const width = ratioToPercent(visual.width || '1/1');
  const height = ratioToPercent(visual.height || '1/1');
  const spaceOccupied = Math.min((width * height) / 100, 100);
  
  // Calculate how much the visual pushes text down
  const pushDownPercent = Math.min(visual.y + height, 100) - visual.y;
  
  return { spaceOccupied, pushDownPercent };
};

export const calculateVisualSpace = (visual: Visual): number => {
  const { spaceOccupied } = calculateVisualImpact(visual);
  return spaceOccupied;
};

export const calculatePageAvailableSpace = (visuals: Visual[], margins: { top: number; right: number; bottom: number; left: number } = { top: 0, right: 0, bottom: 0, left: 0 }): number => {
  if (visuals.length === 0) {
    return Math.max(0, 100 - margins.top - margins.bottom);
  }

  // Sort visuals by vertical position
  const sortedVisuals = [...visuals].sort((a, b) => a.y - b.y);
  
  // Calculate available space considering vertical stacking and margins
  const totalHeight = 100 - margins.top - margins.bottom;
  let occupiedSpace = 0;
  let currentY = margins.top;
  
  for (const visual of sortedVisuals) {
    const { pushDownPercent } = calculateVisualImpact(visual);
    
    // Calculate overlap with previous visuals
    if (visual.y < currentY) {
      occupiedSpace += Math.min(pushDownPercent, currentY - visual.y);
    } else {
      occupiedSpace += pushDownPercent;
    }
    
    // Update current Y position
    currentY = Math.max(currentY, visual.y + pushDownPercent);
  }
  
  return Math.max(0, totalHeight - occupiedSpace);
};

export const calculateAvailableLines = (lineHeight: LineHeight, availableSpace: number): number => {
  const [num, den] = lineHeight.split('/').map(Number);
  const lineHeightPercent = (num / den);
  return Math.floor((availableSpace / 100) / lineHeightPercent);
};

export const calculateWordsPerLine = (columns: number): number => {
  // Base words per line for a full-width column
  const baseWordsPerLine = 12;
  
  // Adjust words per line based on column width
  const columnMultiplier = {
    1: 1,    // Full width
    2: 0.45, // Each column is slightly less than half
    3: 0.3   // Each column is about a third
  }[columns] || 1;

  return Math.floor(baseWordsPerLine * columnMultiplier);
};

export const calculateWordsPerPage = (
  lineHeight: LineHeight,
  columns: 1 | 2 | 3,
  baseWordsPerPage: number
): number => {
  // Extract the ratio from the lineHeight string (e.g., "1/50" -> 1/50)
  const ratio = parseFloat(lineHeight.split('/')[1]);
  
  // Calculate words per page based on line height and columns
  const wordsPerColumn = Math.floor(baseWordsPerPage / ratio);
  return wordsPerColumn * columns;
};

export const distributeWordsAcrossPages = (
  totalWords: number,
  pages: ArticlePage[],
  lineHeight: LineHeight,
  columns: number,
  margins: { top: number; right: number; bottom: number; left: number } = { top: 0, right: 0, bottom: 0, left: 0 }
): ArticlePage[] => {
  let remainingWords = totalWords;
  
  return pages.map(page => {
    const wordsForPage = calculateWordsPerPage(lineHeight, columns, page.availableSpace);
    const pageWords = Math.min(remainingWords, wordsForPage);
    remainingWords -= pageWords;
    
    return {
      ...page,
      wordCount: pageWords
    };
  });
}
