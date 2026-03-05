import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "mammoth", "tiktoken"],
  /* experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "tiktoken"],
  }, */
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      "bufferutil": "commonjs bufferutil",
    });
    return config;
  },
};

export default nextConfig;
