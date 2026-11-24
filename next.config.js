/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  async redirects() {
    return [
      {
        source: '/blog/:slug',
        destination: '/blogs/:slug',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
