import { z } from 'zod'

export type ContentType = 'article' | 'ad' | 'photo' | 'interview' | 'review' | 'shorts' | 'table-of-contents' | 'cover'
export type ZoomLevel = 'all' | '4' | '2' | '1'
export type SizeRatio = '1/10' | '1/8' | '1/6' | '1/4' | '1/3' | '1/2' | 'full'
export type LineHeight = '1/300' | '1/250' | '1/200' | '1/150' | '1/100' | '1/75' | '1/50' | '1/25' | '1/10'
export type PageRatio = '1/1.4142' | '1/1.5' | '1/1.6180' | '1/1.7321'
export type SharePermission = 'read' | 'edit'

export interface SharedUser {
  user_id: string
  permission: SharePermission
  added_at: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Visual {
  id: string
  title: string
  type: 'image' | 'illustration'
  width: SizeRatio
  height: SizeRatio
  x: number
  y: number
  page: number
  url?: string
  spaceOccupied: number // Percentage of page space taken (0-100)
  _dragTimeStamp?: number // Optional timestamp for drag operations
}

export interface ArticlePage {
  pageNumber: number
  visuals: Visual[]
  availableSpace: number // Percentage of page space available for text (0-100)
  wordCount: number // Words that can fit on this page
}

export interface Article {
  id: string
  title: string
  url?: string
  tags: Tag[]
  wordCount: number
  pageCount: number
  visuals: Visual[]
  columns: 1 | 2 | 3
  startPage: number
  wordsPerPage: number
  lineHeight: LineHeight
  isLocked: boolean
  pages: ArticlePage[] // Array of page-specific content
  _lastUpdated?: number // Optional timestamp for tracking updates
}

export interface HistoryEntry {
  articles: Article[]
  description: string
}

export interface MagazineSettings {
  title: string
  issueNumber: string
  publicationDate: string
  pageRatio: PageRatio
}

export interface Magazine {
  id: string
  title: string
  issue_number: string
  publication_date: string
  page_ratio: PageRatio
  created_at: string
  updated_at: string
  user_id: string
  shared_users: SharedUser[]
  state: any
  isShared?: boolean
}

export const pageRatioSchema = z.object({
  name: z.string(),
  value: z.enum(['1/1.4142', '1/1.5', '1/1.6180', '1/1.7321']),
  description: z.string(),
})

export const pageRatios = [
  { name: 'A4 (ISO 216)', value: '1/1.4142', description: 'Standard international paper size ratio' },
  { name: '2:3', value: '1/1.5', description: 'Classic book and magazine ratio' },
  { name: 'Golden Ratio', value: '1/1.6180', description: 'Aesthetically pleasing proportions' },
  { name: '1:√3', value: '1/1.7321', description: 'Tall elegant format' },
] as const

export interface MagazineState {
  articles: Article[]
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
  }
  pages: number
}
