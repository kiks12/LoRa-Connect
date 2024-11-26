import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/map/v3/:z/:x/:y.pbf',
        headers: [
          {
            key: "Content-Type",
            value: "application/x-protobuf"
          },
        ]
      }
    ]
  }
};

export default nextConfig;
