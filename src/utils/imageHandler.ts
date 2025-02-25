import type { Visual } from '../types'

export interface ImageUploadResult {
  base64?: string
  error?: string
}

export async function handleImageUpload(file: File): Promise<ImageUploadResult> {
  return new Promise((resolve) => {
    if (!file.type.match('image.*')) {
      resolve({ error: 'Please select an image file' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      resolve({ base64 })
    }
    reader.onerror = () => {
      resolve({ error: 'Failed to read file' })
    }
    reader.readAsDataURL(file)
  })
}

export function getImageUrl(url: string): string {
  // In a real app, this might handle CDN URLs or other transformations
  return url
}

export function validateVisualPosition(visual: Visual): { x: number, y: number } {
  const x = Math.max(0, Math.min(100, visual.x))
  const y = Math.max(0, Math.min(100, visual.y))
  return { x, y }
}
