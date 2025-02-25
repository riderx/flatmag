import type { Article, LineHeight, SizeRatio, Tag, Visual } from '../types'
import { useTagStore } from '../store/tagStore'

const randomUrls = [
  'https://example.com/tech-future',
  'https://example.com/time-travel',
  'https://example.com/modern-art',
  'https://example.com/dream-science',
  'https://example.com/ancient-civilizations',
  'https://example.com/innovation',
  'https://example.com/nature-secrets',
  'https://example.com/music-evolution',
  'https://example.com/digital-transformation',
  'https://example.com/sustainable-living',
]

const randomLineHeight: LineHeight[] = [
  '1/100',
  '1/75',
  '1/50',
  '1/25',
]

const randomTitles = [
  'The Future of Technology',
  'A Journey Through Time',
  'Understanding Modern Art',
  'The Science Behind Dreams',
  'Exploring Ancient Civilizations',
  'The Power of Innovation',
  'Nature\'s Hidden Secrets',
  'The Evolution of Music',
  'Digital Transformation',
  'Sustainable Living',
]

const coverTitles = [
  'The Innovation Issue',
  'Future Forward',
  'Design & Technology',
  'The Art of Science',
  'Nature\'s Wonders',
  'Urban Living',
  'Digital Revolution',
  'Creative Minds',
]

const randomVisualTitles = [
  'Main Photo',
  'Illustration',
  'Infographic',
  'Portrait',
  'Diagram',
  'Chart',
]

const SIZE_RATIOS: SizeRatio[] = ['1/10', '1/8', '1/6', '1/4', '1/3', '1/2', 'full']

function getRandomUnsplashUrl(): string {
  const seed = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/seed/${seed}/800/600`
}

function getDefaultTags(): Tag[] {
  try {
    // Get tags from Pinia store
    const tagStore = useTagStore()
    if (tagStore.tags && tagStore.tags.length > 0) {
      return tagStore.tags
    }

    // Fallback to default tags if store is empty
    return tagStore.getDefaultTags()
  }
  catch (error) {
    console.warn('Failed to get tags from store, using defaults', error)
    // Fallback with hardcoded defaults if nothing else works
    return [
      { id: 'todo', name: 'To Do', color: '#EF4444' },
      { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
      { id: 'to-review', name: 'To Review', color: '#3B82F6' },
      { id: 'done', name: 'Done', color: '#10B981' },
    ]
  }
}

function generateCoverArticle(availableTags: Tag[]): Omit<Article, 'id' | 'startPage'> {
  const seed = Math.floor(Math.random() * 1000)

  // Use default tags from store if none are available
  let tags: Tag[]
  if (availableTags.length > 0) {
    tags = [availableTags[Math.floor(Math.random() * availableTags.length)]]
  }
  else {
    const defaultTags = getDefaultTags()
    // Find a tag with "Cover" in the name or use the first tag
    const coverTag = defaultTags.find(tag => tag.name.includes('Cover')) || defaultTags[0]
    tags = [coverTag]
  }

  return {
    title: coverTitles[Math.floor(Math.random() * coverTitles.length)],
    tags,
    wordCount: 0,
    pageCount: 1,
    columns: 1,
    lineHeight: '1/50',
    visuals: [{
      id: Math.random().toString(36).substr(2, 9),
      title: 'Cover Image',
      type: 'image',
      width: 'full',
      height: 'full',
      x: 0,
      y: 0,
      page: 1,
      url: `https://picsum.photos/seed/${seed}/1200/1600`,
      spaceOccupied: 100,
    }],
    isLocked: true,
    pages: [],
    wordsPerPage: 0,
  }
}

function generateFullPageImage(availableTags: Tag[]): Omit<Article, 'id' | 'startPage'> {
  const seed = Math.floor(Math.random() * 1000)

  // Use default tags from store if none are available
  let tags: Tag[]
  if (availableTags.length > 0) {
    tags = [availableTags[Math.floor(Math.random() * availableTags.length)]]
  }
  else {
    const defaultTags = getDefaultTags()
    // Find a tag with "Full" in the name or use the first tag
    const fullPageTag = defaultTags.find(tag => tag.name.includes('Full')) || defaultTags[0]
    tags = [fullPageTag]
  }

  return {
    title: 'Full Page Photo',
    tags,
    wordCount: 0,
    pageCount: 1,
    columns: 1,
    lineHeight: '1/50',
    visuals: [{
      id: Math.random().toString(36).substr(2, 9),
      title: 'Full Page Image',
      type: 'image',
      width: 'full',
      height: 'full',
      x: 0,
      y: 0,
      page: 1,
      url: `https://picsum.photos/seed/${seed}/1200/1600`,
      spaceOccupied: 100,
    }],
    isLocked: true,
    pages: [],
    wordsPerPage: 0,
  }
}

function generateRandomVisual(): Visual {
  return {
    id: Math.random().toString(36).substring(2, 9),
    title: randomVisualTitles[Math.floor(Math.random() * randomVisualTitles.length)],
    type: Math.random() > 0.5 ? 'image' : 'illustration',
    width: SIZE_RATIOS[Math.floor(Math.random() * (SIZE_RATIOS.length - 1))] as SizeRatio,
    height: SIZE_RATIOS[Math.floor(Math.random() * (SIZE_RATIOS.length - 1))] as SizeRatio,
    x: Math.floor(Math.random() * 60),
    y: Math.floor(Math.random() * 60),
    page: 1,
    url: Math.random() > 0.5 ? getRandomUnsplashUrl() : undefined,
    spaceOccupied: 0,
  }
}

export function generateRandomArticle(availableTags: Tag[], type: 'regular' | 'cover' | 'full-page' = 'regular'): Omit<Article, 'id' | 'startPage'> {
  // Ensure availableTags is an array
  const tags = Array.isArray(availableTags) ? availableTags : []

  if (type === 'cover') {
    return generateCoverArticle(tags)
  }

  if (type === 'full-page') {
    return generateFullPageImage(tags)
  }

  const title = randomTitles[Math.floor(Math.random() * randomTitles.length)]
  // 50% chance of having a URL
  const url = Math.random() > 0.5 ? randomUrls[Math.floor(Math.random() * randomUrls.length)] : ''

  // Use default tags from store if none are available
  let selectedTags: Tag[]
  if (tags.length > 0) {
    const numTags = Math.floor(Math.random() * Math.min(3, tags.length)) + 1
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5)
    selectedTags = shuffledTags.slice(0, numTags)
  }
  else {
    const defaultTags = getDefaultTags()
    const numTags = Math.floor(Math.random() * Math.min(3, defaultTags.length)) + 1
    const shuffledTags = [...defaultTags].sort(() => Math.random() - 0.5)
    selectedTags = shuffledTags.slice(0, numTags)
  }

  const visuals = Array.from(
    { length: Math.floor(Math.random() * 3) },
    () => generateRandomVisual(),
  )

  let wordCount = 0
  let pageCount = 1
  let columns: 1 | 2 | 3 = 1
  let lineHeight: LineHeight = '1/50'

  if (type === 'regular') {
    wordCount = Math.floor(Math.random() * 2000) + 500
    pageCount = Math.floor(Math.random() * 3) + 1
    columns = [1, 2, 3][Math.floor(Math.random() * 3)] as 1 | 2 | 3
    lineHeight = randomLineHeight[Math.floor(Math.random() * randomLineHeight.length)]
  }
  else if (type === 'cover') {
    wordCount = 0
    pageCount = 1
    columns = 1
  }
  else if (type === 'full-page') {
    wordCount = 0
    pageCount = 1
    columns = 1
  }

  return {
    title,
    url,
    tags: selectedTags,
    wordCount,
    pageCount,
    columns,
    lineHeight,
    visuals,
    wordsPerPage: 0,
    isLocked: false,
    pages: [],
  }
}
