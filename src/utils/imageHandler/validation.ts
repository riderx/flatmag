import type { ImageValidationOptions } from './types'

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export function validateImage(file: File, options: ImageValidationOptions = {}): string | null {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = options

  // Handle cases where file.type might be empty
  const fileType = file.type || 'image/jpeg'

  if (!fileType.startsWith('image/')) {
    return 'File must be an image'
  }

  if (!allowedTypes.includes(fileType)) {
    return `Only ${allowedTypes.map(t => t.split('/')[1]).join(', ')} images are allowed`
  }

  if (file.size > maxSize) {
    return `Image must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
  }

  return null
}
