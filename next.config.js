/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@modelcontextprotocol/sdk"],
  },
  env: {
    AXIONJS_REGISTRY_URL:
      process.env.AXIONJS_REGISTRY_URL || "http://localhost:3000",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
