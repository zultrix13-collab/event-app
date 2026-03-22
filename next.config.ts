import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/internal/ops",
        destination: "/admin",
        permanent: false
      },
      {
        source: "/internal/ops/:path*",
        destination: "/admin/:path*",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
