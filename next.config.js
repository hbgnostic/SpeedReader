/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use empty turbopack config to acknowledge we're aware of Turbopack
  turbopack: {},

  // Required for tesseract.js
  serverExternalPackages: ['tesseract.js'],
};

module.exports = nextConfig;
