export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      // Ensure we have the correct image MIME type
      if (!base64.startsWith('data:image/')) {
        const mimeType = file.type || 'image/jpeg'
        const base64Data = base64.split(',')[1]
        resolve(`data:${mimeType};base64,${base64Data}`)
      }
      else {
        resolve(base64)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function downloadAndConvertToBase64(url: string): Promise<string> {
  try {
    // Handle data URLs directly
    if (url.startsWith('data:')) {
      return url
    }

    // Handle relative URLs
    const fullUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).toString()

    const response = await fetch(fullUrl, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        Accept: 'image/*',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const blob = await response.blob()

    if (!blob.type.startsWith('image/')) {
      throw new Error('Invalid image type')
    }

    const file = new File([blob], 'image', { type: contentType })
    return convertFileToBase64(file)
  }
  catch (error) {
    console.error('Error downloading image:', error)
    throw new Error('Failed to load image. Please try again or use a different image.')
  }
}
