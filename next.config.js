/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['lucide-react'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig