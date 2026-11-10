import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.alnadlan.co.il" },
      { protocol: "https", hostname: "apidev.alnadlan.co.il" },
      { protocol: "https", hostname: "**.alnadlan.co.il" },
      // Media uploads (listing photos, CMS images) are served from DigitalOcean Spaces.
      { protocol: "https", hostname: "nyc3.digitaloceanspaces.com", pathname: "/alnadlan-space/**" },
    ],
  },
};

export default nextConfig;
