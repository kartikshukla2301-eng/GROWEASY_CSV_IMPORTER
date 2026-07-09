const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["groweasy-shared"],
  webpack(config) {
    config.resolve.alias["groweasy-shared"] = path.resolve(__dirname, "../shared/schema.ts");
    return config;
  },
};

module.exports = nextConfig;
