/** @type {import('next').NextConfig} */
// Network storefront engine — single app serving all markets under /s/[market].
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
