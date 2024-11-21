/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
      // domains: ['zealy.io','crew3-production.s3.eu-west-3.amazonaws.com','nitter.net', 'cdn.discordapp.com'],
  },
}

module.exports = nextConfig
