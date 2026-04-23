import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lnkm-image-bucket.s3.eu-north-1.amazonaws.com",
      "cdn.pixabay.com"
    ],
  },
};

export default nextConfig;
