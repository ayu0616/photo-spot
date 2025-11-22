import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,
  images: {},
};

if (process.env.NODE_ENV === "development") {
  const remotePatterns: (URL | RemotePattern)[] = [
    {
      protocol: "https",
      hostname: "lh3.googleusercontent.com",
    },
  ];
  if (process.env.NODE_ENV === "development") {
    remotePatterns.push({
      protocol: "http",
      hostname: "localhost",
      port: "4443",
    });
  }

  nextConfig.images = {
    ...nextConfig.images,
    remotePatterns,
    dangerouslyAllowLocalIP: true,
  };
}

export default nextConfig;
