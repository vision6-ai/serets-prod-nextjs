// Memory cache implementation
const memoryCache = new Map<string, { data: any; expires: number }>()

interface CacheOptions {
  ttl?: number // Time to live in seconds
}

class CacheManager {
  private static instance: CacheManager

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private getMemoryCache<T>(key: string): T | null {
    const cached = memoryCache.get(key)
    const now = Date.now()

    if (cached && cached.expires > now) {
      return cached.data as T
    }

    memoryCache.delete(key)
    return null
  }

  private setMemoryCache(key: string, data: any, ttl: number) {
    memoryCache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    })
  }

  public get<T>(key: string): T | null {
    return this.getMemoryCache(key)
  }

  public set(key: string, data: any, options: CacheOptions = {}) {
    const ttl = options.ttl || 3600 // Default 1 hour
    this.setMemoryCache(key, data, ttl)
  }

  public invalidate(patterns: string[]) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace('*', '.*'))
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key)
        }
      }
    }
  }

  public async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key)
    if (cached) {
      return cached
    }

    // If not in cache, fetch data
    const data = await fetchFn()

    // Store in cache
    this.set(key, data, options)

    return data
  }
}

export const cacheManager = CacheManager.getInstance()