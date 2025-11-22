import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
};

if (process.env.NODE_ENV === "development") {
  const localhostRemotePattern: RemotePattern = {
    protocol: "http",
    hostname: "localhost",
    port: "4443",
  };
  if (nextConfig.images?.remotePatterns) {
    nextConfig.images.remotePatterns.push(localhostRemotePattern);
  } else if (nextConfig.images) {
    nextConfig.images.remotePatterns = [localhostRemotePattern];
  } else {
    nextConfig.images = {
      remotePatterns: [localhostRemotePattern],
    };
  }
}

export default nextConfig;
