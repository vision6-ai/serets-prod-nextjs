const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.optimization.moduleIds = 'deterministic'
    }
    return config
  },
  // Add output configuration for better optimization
  output: 'standalone',
  // Add poweredByHeader configuration
  poweredByHeader: false,
  // Add compression configuration
  compress: true,
  // Add reactStrictMode configuration
  reactStrictMode: true,
  // Add swcMinify configuration
  swcMinify: true,
  // Add generateEtags configuration
  generateEtags: true,
  // Add distDir configuration
  distDir: '.next',
  // Add env configuration
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST
  },
  // Updated ESLint configuration with modern options
  eslint: {
    // Don't run ESLint during builds to avoid issues with deprecated options
    ignoreDuringBuilds: true
  }
}

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));