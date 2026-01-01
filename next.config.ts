import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Fix for WASM not found in production
    // We copy the swisseph.wasm file to the output directory
    const CopyPlugin = require("copy-webpack-plugin");
    const path = require("path");

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "node_modules/swisseph-wasm/wsam/swisseph.wasm"),
            to: path.join(__dirname, ".next/server/chunks"), // Tried location for serverless
            noErrorOnMissing: true,
          },
          // Also copy to public/static/wasm just in case it tries to fetch via http
          {
            from: path.join(__dirname, "node_modules/swisseph-wasm/wsam/swisseph.wasm"),
            to: path.join(__dirname, "public/swisseph.wasm"),
            noErrorOnMissing: true,
          },
        ],
      })
    );

    // Also tried:
    // https://github.com/vercel/next.js/issues/25852#issuecomment-1057059000
    if (isServer) {
      config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
    } else {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    }

    return config;
  },
};

export default nextConfig;
