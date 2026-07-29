import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5002/api/:path*", // Proxy to Backend
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:5002/uploads/:path*", // Proxy static uploads
      },
      {
        source: "/socket.io/:path*",
        destination: "http://127.0.0.1:5002/socket.io/:path*", // Proxy socket.io
      },
    ];
  },
};

export default nextConfig;
