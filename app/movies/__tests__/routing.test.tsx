import { describe, it, expect } from '@jest/globals'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { createRequest, createResponse } from 'node-mocks-http'
import { middleware } from '@/middleware'
import { locales } from '@/config/i18n'

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null })
    }
  }))
}))

describe('Movie Pages Routing', () => {
  const movieRoutes = [
    '/movies/latest',
    '/movies/top-rated',
    '/movies/award-winners',
    '/movies/coming-soon'
  ]

  it.each(locales)('should redirect %s locale movie routes correctly', async (locale) => {
    for (const route of movieRoutes) {
      const req = createRequest({
        method: 'GET',
        url: route
      })
      const res = createResponse()

      await middleware(req)

      // Should redirect to locale-prefixed route
      expect(res.statusCode).toBe(307)
      expect(res.getHeader('Location')).toBe(`/${locale}${route}`)
    }
  })

  it.each(locales)('should serve %s locale movie routes directly', async (locale) => {
    for (const route of movieRoutes) {
      const req = createRequest({
        method: 'GET',
        url: `/${locale}${route}`
      })
      const res = createResponse()

      await middleware(req)

      // Should not redirect already localized routes
      expect(res.statusCode).toBe(200)
    }
  })

  it('should handle movie detail pages with locale', async () => {
    const movieSlug = 'test-movie'
    
    for (const locale of locales) {
      const req = createRequest({
        method: 'GET',
        url: `/${locale}/movies/${movieSlug}`
      })
      const res = createResponse()

      await middleware(req)

      // Should handle dynamic movie routes
      expect(res.statusCode).toBe(200)
    }
  })
})
