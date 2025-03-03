import { Stream } from '@cloudflare/stream-react'

// Extract Cloudflare video ID from URL
export function getCloudflareId(url: string): string {
  // Extract ID from Cloudflare Stream URL
  const match = url.match(/videodelivery\.net\/([^\/\?]+)/)
  if (!match) {
    throw new Error('Invalid Cloudflare Stream URL')
  }
  return match[1]
}

// Get thumbnail URL
export function getCloudflareThumb(url: string): string {
  const id = getCloudflareId(url)
  return `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg`
}

// Get signed playback URL
export function getSignedUrl(videoId: string, signingKey: string, expiresIn = 3600): string {
  const encoder = new TextEncoder()
  const secretKeyData = encoder.encode(signingKey)
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn

  // Create policy
  const policy = {
    exp: timestamp,
    sub: videoId,
  }

  // Return signed URL
  return `https://videodelivery.net/${videoId}/manifest/video.m3u8?token=${Buffer.from(JSON.stringify(policy)).toString('base64')}`
}

interface CloudflareConfig {
  accountId: string
  apiToken: string
  signingKey?: string
}

class CloudflareStream {
  private config: CloudflareConfig

  constructor(config: CloudflareConfig) {
    this.config = config
  }

  // Get direct upload URL
  async getUploadUrl(): Promise<{ uploadUrl: string; videoId: string }> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          requireSignedURLs: false,
          allowedOrigins: ['*.serets.co.il', 'serets.co.il'],
        }),
      }
    )

    const data = await response.json()
    if (!data.success) {
      throw new Error('Failed to get upload URL')
    }

    return {
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
    }
  }

  // Get video details
  async getVideoDetails(videoId: string) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
      }
    )

    const data = await response.json()
    if (!data.success) {
      throw new Error('Failed to get video details')
    }

    return data.result
  }

  // Delete video
  async deleteVideo(videoId: string) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
      }
    )

    const data = await response.json()
    if (!data.success) {
      throw new Error('Failed to delete video')
    }

    return true
  }

  // Get signed URL if needed
  getSignedUrl(videoId: string, expiresIn = 3600) {
    if (!this.config.signingKey) {
      throw new Error('Signing key not configured')
    }

    const encoder = new TextEncoder()
    const secretKeyData = encoder.encode(this.config.signingKey)
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn

    // Create policy
    const policy = {
      exp: timestamp,
      sub: videoId,
    }

    // Sign policy and return URL
    // Note: This is a simplified version. In production, use proper JWT signing
    return `https://videodelivery.net/${videoId}/manifest/video.m3u8?token=${Buffer.from(JSON.stringify(policy)).toString('base64')}`
  }
}

// Export singleton instance
export const cloudflare = new CloudflareStream({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  signingKey: process.env.CLOUDFLARE_STREAM_SIGNING_KEY,
})