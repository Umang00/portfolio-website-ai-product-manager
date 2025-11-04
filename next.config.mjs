/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude pdf-parse from webpack bundling (requires Node.js APIs)
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
