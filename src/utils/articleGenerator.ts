import type { Article, Visual, SizeRatio, LineHeight, Tag } from '../types';

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
  'https://example.com/sustainable-living'
];

const randomLineHeight: LineHeight[] = [
  '1/100', '1/75', '1/50', '1/25'
];

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
  'Sustainable Living'
];

const coverTitles = [
  'The Innovation Issue',
  'Future Forward',
  'Design & Technology',
  'The Art of Science',
  'Nature\'s Wonders',
  'Urban Living',
  'Digital Revolution',
  'Creative Minds'
];

const randomVisualTitles = [
  'Main Photo',
  'Illustration',
  'Infographic',
  'Portrait',
  'Diagram',
  'Chart'
];

const SIZE_RATIOS: SizeRatio[] = ['1/10', '1/8', '1/6', '1/4', '1/3', '1/2', 'full'];

function getRandomUnsplashUrl(): string {
  const seed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}/800/600`;
}

function generateCoverArticle(availableTags: Tag[]): Omit<Article, 'id' | 'startPage'> {
  const seed = Math.floor(Math.random() * 1000);
  return {
    title: coverTitles[Math.floor(Math.random() * coverTitles.length)],
    tags: [availableTags[Math.floor(Math.random() * availableTags.length)]],
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
      spaceOccupied: 100
    }],
    isLocked: true,
    pages: []
  };
}

function generateFullPageImage(availableTags: Tag[]): Omit<Article, 'id' | 'startPage'> {
  const seed = Math.floor(Math.random() * 1000);
  return {
    title: 'Full Page Photo',
    tags: [availableTags[Math.floor(Math.random() * availableTags.length)]],
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
      spaceOccupied: 100
    }],
    isLocked: true,
    pages: []
  };
}

const generateRandomVisual = (): Omit<Visual, 'id'> => ({
  title: randomVisualTitles[Math.floor(Math.random() * randomVisualTitles.length)],
  type: Math.random() > 0.5 ? 'image' : 'illustration',
  width: SIZE_RATIOS[Math.floor(Math.random() * (SIZE_RATIOS.length - 1))] as SizeRatio,
  height: SIZE_RATIOS[Math.floor(Math.random() * (SIZE_RATIOS.length - 1))] as SizeRatio,
  x: Math.floor(Math.random() * 60),
  y: Math.floor(Math.random() * 60),
  page: 1,
  url: Math.random() > 0.5 ? getRandomUnsplashUrl() : undefined,
  spaceOccupied: 0
});

export const generateRandomArticle = (availableTags: Tag[], type?: 'cover' | 'full-page' | 'regular') => {
  if (type === 'cover') {
    return generateCoverArticle(availableTags);
  }
  
  if (type === 'full-page') {
    return generateFullPageImage(availableTags);
  }

  const title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
  const url = Math.random() > 0.7 ? randomUrls[Math.floor(Math.random() * randomUrls.length)] : '';

  const numTags = Math.floor(Math.random() * Math.min(3, availableTags.length)) + 1;
  const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
  const selectedTags = shuffledTags.slice(0, numTags);

  return {
    title,
    url,
    tags: selectedTags,
    wordCount: Math.floor(Math.random() * 2000) + 500,
    columns: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
    lineHeight: randomLineHeight[Math.floor(Math.random() * randomLineHeight.length)],
    visuals: Array.from(
      { length: Math.floor(Math.random() * 3) }, 
      () => generateRandomVisual()
    )
  };
};