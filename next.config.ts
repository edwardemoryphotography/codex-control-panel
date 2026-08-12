import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The home directory contains a stray pnpm-lock.yaml from the home-level
    // setup; without this Next warns "ignored pnpm-lock.yaml ... outside the
    // current Git repository". Scoping Turbopack to this repo silences it.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
