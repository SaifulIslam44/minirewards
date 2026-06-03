/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "ian-combine-especially-bestsellers.trycloudflare.com"
  ],
}

export default nextConfig
