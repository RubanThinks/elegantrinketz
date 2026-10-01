import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/categories/:slug",
        destination: "/shop/:slug",
        permanent: true,
      },
      {
        source: "/collections/:slug",
        destination: "/shop/collection/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
