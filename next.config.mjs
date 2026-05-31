/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "boots-beautiful-marker-tucson.trycloudflare.com"
  ],
}

export default nextConfig
