// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // App Router sudah default di Next.js 14, tidak perlu experimental.appDir
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next/dev" : ".next",

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "lodash-es", "@mui/material", "@mui/icons-material"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
