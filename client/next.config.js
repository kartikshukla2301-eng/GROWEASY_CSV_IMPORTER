const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["groweasy-shared"],
  webpack(config) {
    config.resolve.alias["groweasy-shared"] = path.resolve(__dirname, "../shared/schema.ts");
    config.resolve.alias["zod"] = require.resolve("zod");
    return config;
  },
};

module.exports = nextConfig;
