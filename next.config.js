/** @type {import('next').NextConfig} */
const nextConfig = {

  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Strict mode
  reactStrictMode: true,

  // Vercel Analytics (opcional)
  // Descomente se quiser usar Vercel Analytics
  // experimental: {
  //   webVitalsAttribution: ['CLS', 'LCP'],
  // },
}

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const withNextIntl = require('next-intl/plugin')('./i18n.ts')

module.exports = withNextIntl(withMDX(nextConfig))
