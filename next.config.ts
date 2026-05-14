import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    CLIENT_ID: process.env.CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || "",
  },
};

export default nextConfig;
