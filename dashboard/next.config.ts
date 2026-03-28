import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow access from network IP via mobile hotspot
  // Sets the webpack HMR host so the WebSocket reconnects cleanly
  devIndicators: false,
};

export default nextConfig;
