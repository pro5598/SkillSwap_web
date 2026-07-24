import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5002/api/:path*", // Proxy to Backend
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5002/uploads/:path*", // Proxy static uploads
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:5002/socket.io/:path*", // Proxy socket.io
      },
    ];
  },
};

export default nextConfig;
