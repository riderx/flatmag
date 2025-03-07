import type { ContentType, LineHeight, SizeRatio } from '../../types'

export const contentTypes: ContentType[] = [
  'article',
  'ad',
  'photo',
  'interview',
  'review',
  'shorts',
  'table-of-contents',
  'cover',
]

export const LINE_HEIGHTS: LineHeight[] = [
  '1/300',
  '1/250',
  '1/200',
  '1/150',
  '1/100',
  '1/75',
  '1/50',
  '1/25',
  '1/10',
]

export const SIZE_RATIOS: SizeRatio[] = [
  '1/10',
  '1/8',
  '1/6',
  '1/4',
  '1/3',
  '1/2',
  'full',
]

// Default margin values in percentage
export const DEFAULT_MARGINS = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
}

// Margin step for slider controls (in percentage)
export const MARGIN_STEP = 1
