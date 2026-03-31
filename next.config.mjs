import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = withPayload({
  images: {
    // Keep unoptimized: true to prevent double processing
    unoptimized: true,

    // Define the exact sizes your Payload generates
    deviceSizes: [400, 768, 1200, 1920], // Match your Payload imageSizes
    imageSizes: [150], // Just thumbnail size for small icons

    // Longer cache since images don't change
    minimumCacheTTL: 31536000, // 1 year

    // Allow your media domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Add your production domain
      {
        protocol: "https",
        hostname: "yourdomain.com", // Replace with actual domain
      },
      // UploadThing CDN domains
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.utfs.io",
      },
    ],
  },

  // Compress static files
  compress: true,

  // Optimize build output
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Exclude large files from serverless functions
  serverExternalPackages: ["sharp"],

  // Optimize bundle size
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude media files from server bundles
      config.externals = config.externals || [];
      config.externals.push({
        "public/media": "commonjs public/media",
      });
    }
    return config;
  },


  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add headers for better caching
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  redirects: async () => {
    return [
      {
        source: "/specials",
        destination: "/specials/engagement",
        permanent: true,
      },
    ];
  },
});

export default nextConfig;
