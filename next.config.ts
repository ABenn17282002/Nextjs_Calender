import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google OAuth の画像
      "avatars.githubusercontent.com", // GitHub のプロフィール画像
    ],
  },
};

export default nextConfig;
