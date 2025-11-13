/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable optimization for better quality
    formats: ['image/avif', 'image/webp'],
    // Required in Next.js 16+: Define allowed quality values
    qualities: [75, 90, 100],
    // Increase quality for high-res images
    minimumCacheTTL: 60,
    // Allow larger image sizes for high-res displays
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Exclude pdf-parse from webpack bundling (requires Node.js APIs)
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
