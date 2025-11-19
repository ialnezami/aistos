/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow webhook routes to receive raw body for signature verification
  api: {
    bodyParser: false,
  },
}

module.exports = nextConfig

