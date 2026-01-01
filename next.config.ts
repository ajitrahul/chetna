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
    const CopyPlugin = require("copy-webpack-plugin");
    const path = require("path");
    const webpack = require("webpack");
    // Configure alias to ignore swisseph.data
    // This makes require('./swisseph.data') return an empty object
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.join(__dirname, "node_modules/swisseph-wasm/wsam/swisseph.data")]: false,
    };

    // Copy WASM files to public directory for runtime access
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "node_modules/swisseph-wasm/wsam/swisseph.wasm"),
            to: path.join(__dirname, "public/swisseph.wasm"),
            noErrorOnMissing: false,
          },
          {
            from: path.join(__dirname, "node_modules/swisseph-wasm/wsam/swisseph.data"),
            to: path.join(__dirname, "public/swisseph.data"),
            noErrorOnMissing: false,
          },
        ],
      })
    );

    // Don't set webassemblyModuleFilename - let Next.js handle it

    return config;
  },
};

export default nextConfig;
