/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Add ENV variables that need to be exposed to the browser
  env: {
    APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
