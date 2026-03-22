import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Legacy overview URL only — sub-routes stay under /internal/ops/* until migrated (Phase C+).
      { source: "/internal/ops", destination: "/admin", permanent: false }
    ];
  }
};

export default nextConfig;
