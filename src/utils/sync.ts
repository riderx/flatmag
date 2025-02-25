// Use Web Crypto API for browser-compatible hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function generateChecksum(data: any): Promise<string> {
  try {
    // Sort object keys to ensure consistent order
    const sortedData = JSON.stringify(data, Object.keys(data).sort())
    return await sha256(sortedData)
  }
  catch (error) {
    console.error('Error generating checksum:', error)
    return ''
  }
}

export async function verifyChecksum(data: any, checksum: string): Promise<boolean> {
  try {
    const calculatedChecksum = await generateChecksum(data)
    return calculatedChecksum === checksum
  }
  catch (error) {
    console.error('Error verifying checksum:', error)
    return false
  }
}
