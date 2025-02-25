import type { ImageUploadResult } from './types'
import { convertFileToBase64, downloadAndConvertToBase64 } from './conversion'
import { calculateVisualSpace, validateVisualPosition } from './position'
import { validateImage } from './validation'

export async function handleImageUpload(file: File): Promise<ImageUploadResult> {
  try {
    const validationError = validateImage(file)
    if (validationError) {
      throw new Error(validationError)
    }

    const base64 = await convertFileToBase64(file)
    return { url: base64, base64 }
  }
  catch (error) {
    console.error('Error uploading image:', error)
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

export async function getImageUrl(url: string, retries = 3): Promise<string> {
  if (url.startsWith('data:')) {
    return url
  }

  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      return await downloadAndConvertToBase64(url)
    }
    catch (error) {
      lastError = error
      if (i < retries - 1) {
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000))
      }
    }
  }

  throw lastError
}

export {
  calculateVisualSpace,
  convertFileToBase64,
  downloadAndConvertToBase64,
  validateVisualPosition,
}
