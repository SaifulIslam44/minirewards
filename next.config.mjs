/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "placement-improve-collectables-visible.trycloudflare.com"
  ],
}

export default nextConfig
